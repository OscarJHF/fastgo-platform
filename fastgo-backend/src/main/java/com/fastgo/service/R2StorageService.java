package com.fastgo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Paths;
import java.util.List;

@Service("r2StorageService")
public class R2StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(R2StorageService.class);

    private final String endpoint;
    private final String bucketName;
    private final String accessKey;
    private final String secretKey;
    private final LocalStorageService localStorageService;
    private S3Client s3Client;
    private boolean initialized = false;

    public R2StorageService(
            @Value("${fastgo.storage.r2.endpoint:}") String endpoint,
            @Value("${fastgo.storage.r2.bucket:}") String bucketName,
            @Value("${fastgo.storage.r2.access-key:}") String accessKey,
            @Value("${fastgo.storage.r2.secret-key:}") String secretKey,
            LocalStorageService localStorageService) {
        this.endpoint = endpoint;
        this.bucketName = bucketName;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.localStorageService = localStorageService;
        initClient();
    }

    private void initClient() {
        if (endpoint != null && !endpoint.isBlank()
                && bucketName != null && !bucketName.isBlank()
                && accessKey != null && !accessKey.isBlank()
                && secretKey != null && !secretKey.isBlank()) {
            try {
                this.s3Client = S3Client.builder()
                        .endpointOverride(URI.create(endpoint.trim()))
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())))
                        .region(Region.of("auto"))
                        .build();
                this.initialized = true;
                log.info("Cloudflare R2 Storage inicializado exitosamente contra bucket: {}", bucketName);
            } catch (Exception e) {
                log.warn("Fallo al inicializar cliente Cloudflare R2: {}. Se utilizará LocalStorageService.", e.getMessage());
                this.initialized = false;
            }
        } else {
            log.info("Cloudflare R2 no configurado completamente. Operando con LocalStorageService.");
            this.initialized = false;
        }
    }

    public boolean isR2Configured() {
        return this.initialized && this.s3Client != null;
    }

    @Override
    public String storePublic(MultipartFile file, String filename) throws IOException {
        if (!isR2Configured()) {
            return localStorageService.storePublic(file, filename);
        }
        try {
            String key = "public/" + filename;
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();
            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            try {
                localStorageService.storePublic(file, filename);
            } catch (Exception ignored) {}
            return "/api/uploads/" + filename;
        } catch (Exception e) {
            log.error("Error subiendo archivo público a R2: {}. Usando fallback local.", e.getMessage());
            return localStorageService.storePublic(file, filename);
        }
    }

    @Override
    public Resource loadPublic(String filename) {
        if (isR2Configured()) {
            try {
                String key = "public/" + filename;
                ResponseBytes<GetObjectResponse> bytes = s3Client.getObjectAsBytes(
                        GetObjectRequest.builder().bucket(bucketName).key(key).build());
                return new ByteArrayResource(bytes.asByteArray(), filename);
            } catch (NoSuchKeyException e) {
                log.debug("Archivo no encontrado en R2: public/{}", filename);
            } catch (Exception e) {
                log.warn("Error leyendo de R2: {}. Intentando fallback local.", e.getMessage());
            }
        }
        return localStorageService.loadPublic(filename);
    }

    @Override
    public MediaType getPublicMediaType(String filename) {
        return localStorageService.getPublicMediaType(filename);
    }

    @Override
    public String storePrivateProof(MultipartFile file, String filename) throws IOException {
        if (!isR2Configured()) {
            return localStorageService.storePrivateProof(file, filename);
        }
        try {
            String key = "payment-proofs/" + filename;
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();
            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            try {
                localStorageService.storePrivateProof(file, filename);
            } catch (Exception ignored) {}
            return filename;
        } catch (Exception e) {
            log.error("Error subiendo comprobante privado a R2: {}. Usando fallback local.", e.getMessage());
            return localStorageService.storePrivateProof(file, filename);
        }
    }

    private String findR2ProofKey(Integer pedidoId, String fallbackFilename) {
        if (pedidoId != null) {
            try {
                ListObjectsV2Response res = s3Client.listObjectsV2(ListObjectsV2Request.builder()
                        .bucket(bucketName)
                        .prefix("payment-proofs/proof_" + pedidoId + "_")
                        .maxKeys(1)
                        .build());
                List<S3Object> contents = res.contents();
                if (contents != null && !contents.isEmpty()) {
                    return contents.get(0).key();
                }
            } catch (Exception ignored) {}
        }
        if (fallbackFilename != null && !fallbackFilename.isBlank()) {
            String clean = Paths.get(fallbackFilename).getFileName().toString();
            String directKey = "payment-proofs/" + clean;
            try {
                s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(directKey).build());
                return directKey;
            } catch (Exception ignored) {}
        }
        return null;
    }

    @Override
    public Resource loadPrivateProof(Integer pedidoId, String fallbackFilename) {
        if (isR2Configured()) {
            try {
                String key = findR2ProofKey(pedidoId, fallbackFilename);
                if (key != null) {
                    ResponseBytes<GetObjectResponse> bytes = s3Client.getObjectAsBytes(
                            GetObjectRequest.builder().bucket(bucketName).key(key).build());
                    String name = key.contains("/") ? key.substring(key.lastIndexOf('/') + 1) : key;
                    return new ByteArrayResource(bytes.asByteArray(), name);
                }
            } catch (Exception e) {
                log.warn("Error leyendo comprobante privado de R2: {}. Probando local.", e.getMessage());
            }
        }
        return localStorageService.loadPrivateProof(pedidoId, fallbackFilename);
    }

    @Override
    public MediaType getPrivateProofMediaType(String filename) {
        return localStorageService.getPrivateProofMediaType(filename);
    }

    @Override
    public boolean existsPrivateProof(Integer pedidoId, String fallbackFilename) {
        if (isR2Configured()) {
            if (findR2ProofKey(pedidoId, fallbackFilename) != null) {
                return true;
            }
        }
        return localStorageService.existsPrivateProof(pedidoId, fallbackFilename);
    }

    @Override
    public void deletePrivateProof(Integer pedidoId, String fallbackFilename) {
        if (isR2Configured()) {
            try {
                String key = findR2ProofKey(pedidoId, fallbackFilename);
                if (key != null) {
                    s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
                }
            } catch (Exception e) {
                log.warn("Error eliminando objeto de R2: {}", e.getMessage());
            }
        }
        localStorageService.deletePrivateProof(pedidoId, fallbackFilename);
    }
}
