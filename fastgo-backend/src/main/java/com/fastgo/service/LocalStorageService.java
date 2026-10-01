package com.fastgo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;

@Service("localStorageService")
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path uploadDir;
    private final Path publicDir;
    private final Path proofsDir;

    public LocalStorageService(@Value("${fastgo.upload.dir:uploads}") String uploadDirPath) {
        Path targetUploadDir = Paths.get(uploadDirPath != null ? uploadDirPath : "uploads").toAbsolutePath().normalize();
        Path targetPublicDir = targetUploadDir.resolve("public").normalize();
        Path targetProofsDir = targetUploadDir.resolve("payment-proofs").normalize();

        try {
            Files.createDirectories(targetPublicDir);
            Files.createDirectories(targetProofsDir);
        } catch (Exception e) {
            log.warn("No se pudieron crear directorios en {}. Usando fallback a tempdir: {}", targetUploadDir, e.getMessage());
            Path fallback = Paths.get(System.getProperty("java.io.tmpdir", "/tmp")).resolve("fastgo-uploads").normalize();
            try {
                Files.createDirectories(fallback.resolve("public").normalize());
                Files.createDirectories(fallback.resolve("payment-proofs").normalize());
                targetUploadDir = fallback;
                targetPublicDir = fallback.resolve("public").normalize();
                targetProofsDir = fallback.resolve("payment-proofs").normalize();
            } catch (Exception ex) {
                log.error("Fallo crítico al crear directorios fallback en {}: {}", fallback, ex.getMessage());
            }
        }

        this.uploadDir = targetUploadDir;
        this.publicDir = targetPublicDir;
        this.proofsDir = targetProofsDir;
    }

    @Override
    public String storePublic(MultipartFile file, String filename) throws IOException {
        Path target = this.publicDir.resolve(filename).normalize();
        if (!target.getParent().equals(this.publicDir)) {
            throw new SecurityException("Intento de path traversal detectado.");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return "/api/uploads/" + filename;
    }

    @Override
    public Resource loadPublic(String filename) {
        try {
            Path target = this.publicDir.resolve(filename).normalize();
            if (!Files.exists(target) || !Files.isReadable(target)) {
                target = this.uploadDir.resolve(filename).normalize();
            }
            if (Files.exists(target) && Files.isReadable(target)) {
                return new UrlResource(target.toUri());
            }
        } catch (MalformedURLException e) {
            log.warn("Error cargando recurso público {}: {}", filename, e.getMessage());
        }
        return null;
    }

    @Override
    public MediaType getPublicMediaType(String filename) {
        return resolveMediaType(filename);
    }

    @Override
    public String storePrivateProof(MultipartFile file, String filename) throws IOException {
        Path target = this.proofsDir.resolve(filename).normalize();
        if (!target.getParent().equals(this.proofsDir)) {
            throw new SecurityException("Intento de path traversal detectado en comprobante.");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    private Path resolveProofPath(Integer pedidoId, String fallbackFilename) {
        if (pedidoId != null) {
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(this.proofsDir, "proof_" + pedidoId + "_*")) {
                for (Path p : stream) {
                    if (Files.isReadable(p)) return p;
                }
            } catch (IOException ignored) {}
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(this.proofsDir, "proof_" + pedidoId + ".*")) {
                for (Path p : stream) {
                    if (Files.isReadable(p)) return p;
                }
            } catch (IOException ignored) {}
        }
        if (fallbackFilename != null && !fallbackFilename.isBlank()) {
            String cleanName = Paths.get(fallbackFilename).getFileName().toString();
            Path candidate = this.proofsDir.resolve(cleanName).normalize();
            if (Files.exists(candidate) && Files.isReadable(candidate)) return candidate;
            candidate = this.uploadDir.resolve(cleanName).normalize();
            if (Files.exists(candidate) && Files.isReadable(candidate)) return candidate;
        }
        return null;
    }

    @Override
    public Resource loadPrivateProof(Integer pedidoId, String fallbackFilename) {
        Path p = resolveProofPath(pedidoId, fallbackFilename);
        if (p != null && Files.exists(p) && Files.isReadable(p)) {
            try {
                return new UrlResource(p.toUri());
            } catch (MalformedURLException e) {
                log.warn("Error creando URLResource para comprobante: {}", e.getMessage());
            }
        }
        return null;
    }

    @Override
    public MediaType getPrivateProofMediaType(String filename) {
        return resolveMediaType(filename);
    }

    @Override
    public boolean existsPrivateProof(Integer pedidoId, String fallbackFilename) {
        return resolveProofPath(pedidoId, fallbackFilename) != null;
    }

    @Override
    public void deletePrivateProof(Integer pedidoId, String fallbackFilename) {
        Path p = resolveProofPath(pedidoId, fallbackFilename);
        if (p != null) {
            try {
                Files.deleteIfExists(p);
            } catch (IOException e) {
                log.warn("No se pudo eliminar el comprobante: {}", e.getMessage());
            }
        }
    }

    private MediaType resolveMediaType(String filename) {
        if (filename == null) return MediaType.APPLICATION_OCTET_STREAM;
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        if (lower.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
