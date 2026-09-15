package com.fastgo.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiration;

    public JwtService(
            @Value("${fastgo.jwt.secret}") String secret,
            @Value("${fastgo.jwt.expiration-ms:3600000}") long expiration) {

        if (secret == null || secret.isBlank()
                || secret.contains("CHANGE_THIS")
                || secret.length() < 32) {
            throw new IllegalArgumentException(
                    "FASTGO_JWT_SECRET debe estar configurado y tener al menos 32 caracteres seguros");
        }

        if (expiration <= 0) {
            throw new IllegalArgumentException("fastgo.jwt.expiration-ms debe ser mayor que cero");
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generarToken(String correo, String rol) {
        return Jwts.builder()
                .subject(correo)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    public String extraerRol(String token) {
        return claims(token).get("rol", String.class);
    }

    public String extraerCorreo(String token) {
        return claims(token).getSubject();
    }

    public boolean validarToken(String token) {
        try {
            claims(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
