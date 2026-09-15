package com.fastgo.service;

import com.fastgo.dto.LoginRequest;
import com.fastgo.entity.Usuario;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Usuario login(LoginRequest request) {
        if (request == null
                || request.getCorreo() == null
                || request.getCorreo().isBlank()
                || request.getPassword() == null
                || request.getPassword().isBlank()) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        String correo = request.getCorreo().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new BadCredentialsException("Correo o contraseña incorrectos"));

        if (!Boolean.TRUE.equals(usuario.getEstado())
                || usuario.getRol() == null
                || usuario.getRol().getNombre() == null) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        return usuario;
    }

    public String generarToken(Usuario usuario) {
        String rol = usuario.getRol().getNombre().trim().toUpperCase();
        return jwtService.generarToken(usuario.getCorreo(), rol);
    }
}
