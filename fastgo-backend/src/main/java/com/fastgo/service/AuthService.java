package com.fastgo.service;

import com.fastgo.dto.LoginRequest;
import com.fastgo.entity.Usuario;
import com.fastgo.jwt.JwtService;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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

        List<Usuario> usuarios = usuarioRepository.findAllByCorreo(correo);
        if (usuarios.isEmpty()) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        Usuario usuario = null;
        String requestedRol = request.getRol() != null ? request.getRol().trim().toUpperCase() : null;

        if (requestedRol != null && !requestedRol.isBlank()) {
            for (Usuario u : usuarios) {
                if (u.getRol() != null && requestedRol.equalsIgnoreCase(u.getRol().getNombre())) {
                    usuario = u;
                    break;
                }
            }
            if (usuario == null) {
                throw new BadCredentialsException("No existe una cuenta activa con el rol " + requestedRol + " para este correo");
            }
        } else {
            for (Usuario u : usuarios) {
                if (passwordEncoder.matches(request.getPassword(), u.getPassword())) {
                    usuario = u;
                    break;
                }
            }
            if (usuario == null) {
                usuario = usuarios.get(0);
            }
        }

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
