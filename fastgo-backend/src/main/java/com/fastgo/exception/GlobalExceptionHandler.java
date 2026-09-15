package com.fastgo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> badCredentials() {
        return response(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Correo o contraseña incorrectos");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        Map<String, Object> body = base(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                "Los datos enviados no son válidos");
        body.put("fields", fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integrity() {
        return response(HttpStatus.CONFLICT, "CONFLICT", "La operación entra en conflicto con los datos existentes");
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> accessDenied(org.springframework.security.access.AccessDeniedException exception) {
        return response(HttpStatus.FORBIDDEN, "FORBIDDEN", "No tienes permisos para realizar esta operación");
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> authentication(org.springframework.security.core.AuthenticationException exception) {
        return response(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Autenticación requerida o credenciales inválidas");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> illegalArgument(IllegalArgumentException exception) {
        return response(HttpStatus.BAD_REQUEST, "BAD_REQUEST", safeMessage(exception));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> illegalState(IllegalStateException exception) {
        return response(HttpStatus.BAD_REQUEST, "BAD_REQUEST", safeMessage(exception));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> runtime(RuntimeException exception) {
        String message = safeMessage(exception);
        String lower = message.toLowerCase();
        if (lower.contains("no encontrad") || lower.contains("no existe")) {
            return response(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
        }
        if (lower.contains("no tienes permiso") || lower.contains("no pertenece al usuario") || lower.contains("no está asignado")) {
            return response(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
        }
        if (lower.contains("no autenticado")) {
            return response(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
        }
        return response(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> general() {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Error interno del servidor");
    }

    private String safeMessage(RuntimeException exception) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? "Error de operación" : message;
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String error, String message) {
        return ResponseEntity.status(status).body(base(status, error, message));
    }

    private Map<String, Object> base(HttpStatus status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return body;
    }
}
