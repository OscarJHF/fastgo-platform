package com.fastgo.controller;

import com.fastgo.dto.UploadResponseDTO;
import com.fastgo.service.StorageService;
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

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping
    public ResponseEntity<UploadResponseDTO> subirArchivoPublico(@RequestParam("file") MultipartFile file) {
        // Valida extensión, MIME declarado, tamaño y MAGIC BYTES reales para imágenes de catálogo/tienda
        FileValidationUtils.validateProductImage(file);

        String extension = FileValidationUtils.getCleanExtension(file.getOriginalFilename());
        String secureFilename = UUID.randomUUID() + "." + extension;

        String fileUrl;
        try {
            fileUrl = storageService.storePublic(file, secureFilename);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo en el servidor: " + e.getMessage(), e);
        }

        return ResponseEntity.ok(new UploadResponseDTO(fileUrl, secureFilename, file.getSize(), file.getContentType()));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> servirArchivoPublico(@PathVariable String filename) {
        // Solo imágenes públicas. Comprobantes bancarios y PDFs están estrictamente prohibidos aquí.
        if (!SAFE_PUBLIC_FILENAME_PATTERN.matcher(filename).matches()) {
            return ResponseEntity.badRequest().build();
        }

        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.contains("proof") || lowerFilename.contains("comprobante") || lowerFilename.contains("payment-proofs")) {
            return ResponseEntity.status(403).build();
        }

        Resource resource = storageService.loadPublic(filename);
        if (resource == null || !resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = storageService.getPublicMediaType(filename);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }
}
