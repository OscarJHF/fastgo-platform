package com.fastgo.util;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Set;

public class FileValidationUtils {

    public static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    public static final long MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_PRODUCT_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_PROOF_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "pdf");

    public static String getCleanExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Nombre de archivo inválido o vacío.");
        }
        String cleanName = Paths.get(originalFilename).getFileName().toString();
        int dotIndex = cleanName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == cleanName.length() - 1) {
            throw new IllegalArgumentException("El archivo no tiene una extensión válida.");
        }
        return cleanName.substring(dotIndex + 1).toLowerCase();
    }

    public static void validateProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No se ha enviado ningún archivo o el archivo está vacío.");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("La imagen excede el tamaño máximo permitido de 5 MB.");
        }

        String extension = getCleanExtension(file.getOriginalFilename());
        if (!ALLOWED_PRODUCT_EXTENSIONS.contains(extension)) {
            if ("pdf".equalsIgnoreCase(extension)) {
                throw new IllegalArgumentException("No se permite formato PDF para fotos de productos. Solo imágenes JPG, PNG o WEBP.");
            }
            throw new IllegalArgumentException("Formato no permitido para productos. Solo se admiten: " + String.join(", ", ALLOWED_PRODUCT_EXTENSIONS));
        }

        String declaredMime = file.getContentType();
        if (declaredMime != null && !declaredMime.isBlank()) {
            String lower = declaredMime.toLowerCase();
            if (!lower.startsWith("image/") || lower.contains("pdf")) {
                throw new IllegalArgumentException("El tipo de contenido declarado no es una imagen válida: " + declaredMime);
            }
        }

        byte[] header = readHeader(file, 16);
        String realMime = detectRealMimeType(header);
        if (realMime == null || !realMime.startsWith("image/")) {
            throw new IllegalArgumentException("El contenido del archivo no corresponde a una imagen válida (JPG, PNG, WEBP). Se detectó contenido no admitido.");
        }

        // Validar correspondencia entre extensión y tipo real
        validateExtensionMatchesMime(extension, realMime);
    }

    public static void validatePaymentProof(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No se ha enviado ningún archivo o el comprobante está vacío.");
        }
        if (file.getSize() > MAX_PROOF_SIZE) {
            throw new IllegalArgumentException("El comprobante excede el tamaño máximo permitido de 10 MB.");
        }

        String extension = getCleanExtension(file.getOriginalFilename());
        if (!ALLOWED_PROOF_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Formato no admitido para comprobantes de pago. Solo se aceptan: " + String.join(", ", ALLOWED_PROOF_EXTENSIONS));
        }

        String declaredMime = file.getContentType();
        if (declaredMime != null && !declaredMime.isBlank()) {
            String lower = declaredMime.toLowerCase();
            boolean validDeclared = lower.startsWith("image/") || lower.equals("application/pdf");
            if (!validDeclared) {
                throw new IllegalArgumentException("El tipo de contenido declarado no es válido para comprobantes: " + declaredMime);
            }
        }

        byte[] header = readHeader(file, 16);
        String realMime = detectRealMimeType(header);
        if (realMime == null) {
            throw new IllegalArgumentException("El contenido del archivo no corresponde a un formato seguro válido (JPG, PNG, WEBP, PDF).");
        }

        validateExtensionMatchesMime(extension, realMime);
    }

    public static String detectRealMimeType(byte[] bytes) {
        if (bytes == null || bytes.length < 4) {
            return null;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (bytes.length >= 8 &&
                (bytes[0] & 0xFF) == 0x89 &&
                bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 &&
                bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return "image/png";
        }

        // JPEG: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        // WEBP: RIFF .... WEBP
        if (bytes.length >= 12 &&
                bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }

        // PDF: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
        if (bytes.length >= 5 &&
                bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F' && bytes[4] == '-') {
            return "application/pdf";
        }

        return null;
    }

    private static void validateExtensionMatchesMime(String extension, String realMime) {
        switch (extension) {
            case "png":
                if (!"image/png".equals(realMime)) {
                    throw new IllegalArgumentException("El archivo tiene extensión .png pero su contenido real es " + realMime);
                }
                break;
            case "jpg":
            case "jpeg":
                if (!"image/jpeg".equals(realMime)) {
                    throw new IllegalArgumentException("El archivo tiene extensión JPG pero su contenido real es " + realMime);
                }
                break;
            case "webp":
                if (!"image/webp".equals(realMime)) {
                    throw new IllegalArgumentException("El archivo tiene extensión .webp pero su contenido real es " + realMime);
                }
                break;
            case "pdf":
                if (!"application/pdf".equals(realMime)) {
                    throw new IllegalArgumentException("El archivo tiene extensión .pdf pero su contenido real es " + realMime);
                }
                break;
        }
    }

    private static byte[] readHeader(MultipartFile file, int bytesToRead) {
        byte[] buffer = new byte[bytesToRead];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(buffer);
            if (read <= 0) {
                return new byte[0];
            }
            if (read < bytesToRead) {
                byte[] exact = new byte[read];
                System.arraycopy(buffer, 0, exact, 0, read);
                return exact;
            }
            return buffer;
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el contenido del archivo para verificación: " + e.getMessage(), e);
        }
    }
}
