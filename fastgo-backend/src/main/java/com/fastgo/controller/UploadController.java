package com.fastgo.controller;

import com.fastgo.dto.UploadResponseDTO;
import com.fastgo.util.FileValidationUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final Pattern SAFE_PUBLIC_FILENAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|webp)$", Pattern.CASE_INSENSITIVE);

    private final Path uploadDir;
    private final Path publicDir;

    public UploadController(@Value("${fastgo.upload.dir:uploads}") String uploadDirPath) {
        Path targetUploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        Path targetPublicDir = targetUploadDir.resolve("public").normalize();
        try {
            Files.createDirectories(targetPublicDir);
        } catch (Exception e) {
            Path fallback = Paths.get(System.getProperty("java.io.tmpdir", "/tmp")).resolve("fastgo-uploads").normalize();
            try {
                Files.createDirectories(fallback.resolve("public").normalize());
                targetUploadDir = fallback;
                targetPublicDir = fallback.resolve("public").normalize();
            } catch (Exception ex) {
                // If even fallback fails, retain targetUploadDir without crashing startup
            }
        }
        this.uploadDir = targetUploadDir;
        this.publicDir = targetPublicDir;
    }

    @PostMapping
    public ResponseEntity<UploadResponseDTO> subirArchivoPublico(@RequestParam("file") MultipartFile file) {
        // Valida extensión, MIME declarado, tamaño y MAGIC BYTES reales para imágenes de catálogo/tienda
        FileValidationUtils.validateProductImage(file);

        String extension = FileValidationUtils.getCleanExtension(file.getOriginalFilename());
        String secureFilename = UUID.randomUUID() + "." + extension;
        Path targetPath = this.publicDir.resolve(secureFilename).normalize();

        if (!targetPath.getParent().equals(this.publicDir)) {
            throw new SecurityException("Intento de navegación de directorios no permitido.");
        }

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo en el servidor: " + e.getMessage(), e);
        }

        String fileUrl = "/api/uploads/" + secureFilename;
        String mime = FileValidationUtils.detectRealMimeType(new byte[]{}); // header already validated
        return ResponseEntity.ok(new UploadResponseDTO(fileUrl, secureFilename, file.getSize(), file.getContentType()));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> servirArchivoPublico(@PathVariable String filename) {
        // Solo imágenes públicas. Comprobantes bancarios y PDFs están estrictamente prohibidos aquí.
        if (!SAFE_PUBLIC_FILENAME_PATTERN.matcher(filename).matches()) {
            return ResponseEntity.badRequest().build();
        }

        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.contains("proof") || lowerFilename.contains("comprobante")) {
            return ResponseEntity.status(403).build();
        }

        // Buscar en publicDir primero, o en uploadDir raíz para retrocompatibilidad de imágenes previas
        Path filePath = this.publicDir.resolve(filename).normalize();
        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            filePath = this.uploadDir.resolve(filename).normalize();
        }

        // Seguridad: El archivo debe estar dentro de publicDir o uploadDir y NO dentro de payment-proofs
        if (!filePath.startsWith(this.publicDir) && !filePath.getParent().equals(this.uploadDir)) {
            return ResponseEntity.status(403).build();
        }

        if (filePath.toString().contains("payment-proofs") || filePath.toString().contains("comprobante")) {
            return ResponseEntity.status(403).build();
        }

        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            MediaType mediaType = determineImageMediaType(filename);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private MediaType determineImageMediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
