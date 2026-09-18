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
    private final com.fastgo.repository.RolRepository rolRepository;
    private final com.fastgo.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            com.fastgo.repository.RolRepository rolRepository,
            com.fastgo.repository.PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rolRepository = rolRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    public com.fastgo.dto.LoginResponse autenticar(LoginRequest request) {
        Usuario usuario = login(request);
        List<String> availableRoles = resolverRolesDisponibles(usuario);
        String activeRole = usuario.getRol() != null ? usuario.getRol().getNombre().toUpperCase() : "CLIENTE";
        String token = jwtService.generarToken(usuario.getCorreo(), activeRole, availableRoles);

        com.fastgo.dto.UsuarioResponseDTO userDto = new com.fastgo.dto.UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getFoto(),
                usuario.getEstado(),
                activeRole
        );
        userDto.setActiveRole(activeRole);
        userDto.setAvailableRoles(availableRoles);

        return new com.fastgo.dto.LoginResponse(
                token,
                "Bienvenido " + usuario.getNombre(),
                userDto,
                activeRole,
                availableRoles
        );
    }

    public com.fastgo.dto.LoginResponse cambiarRol(String nuevoRol) {
        if (nuevoRol == null || nuevoRol.isBlank()) {
            throw new IllegalArgumentException("El nuevo rol es obligatorio");
        }
        String cleanRol = nuevoRol.trim().toUpperCase();

        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Usuario usuario = usuarioRepository.findByCorreo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

        if (!usuario.hasRole(cleanRol)) {
            throw new IllegalArgumentException("El usuario no posee el rol " + cleanRol);
        }

        com.fastgo.entity.Rol rolEntity = rolRepository.findByNombreIgnoreCase(cleanRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado en el sistema"));

        usuario.setRol(rolEntity);
        usuario = usuarioRepository.save(usuario);

        List<String> availableRoles = resolverRolesDisponibles(usuario);
        String token = jwtService.generarToken(usuario.getCorreo(), cleanRol, availableRoles);

        com.fastgo.dto.UsuarioResponseDTO userDto = new com.fastgo.dto.UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getFoto(),
                usuario.getEstado(),
                cleanRol
        );
        userDto.setActiveRole(cleanRol);
        userDto.setAvailableRoles(availableRoles);

        return new com.fastgo.dto.LoginResponse(
                token,
                "Rol cambiado con éxito a " + cleanRol,
                userDto,
                cleanRol,
                availableRoles
        );
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

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new BadCredentialsException("Cuenta inactiva o deshabilitada");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        List<String> availableRoles = resolverRolesDisponibles(usuario);
        String requestedRol = request.getRol() != null ? request.getRol().trim().toUpperCase() : null;

        if (requestedRol != null && !requestedRol.isBlank()) {
            if (!availableRoles.contains(requestedRol)) {
                throw new BadCredentialsException("No existe el rol " + requestedRol + " para este usuario");
            }
            com.fastgo.entity.Rol rolEntity = rolRepository.findByNombreIgnoreCase(requestedRol)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            usuario.setRol(rolEntity);
            usuario = usuarioRepository.save(usuario);
        } else if (usuario.getRol() == null && !availableRoles.isEmpty()) {
            com.fastgo.entity.Rol rolEntity = rolRepository.findByNombreIgnoreCase(availableRoles.get(0))
                    .orElse(null);
            if (rolEntity != null) {
                usuario.setRol(rolEntity);
                usuario = usuarioRepository.save(usuario);
            }
        }

        return usuario;
    }

    public String generarToken(Usuario usuario) {
        String rol = usuario.getRol() != null ? usuario.getRol().getNombre().trim().toUpperCase() : "CLIENTE";
        List<String> availableRoles = resolverRolesDisponibles(usuario);
        return jwtService.generarToken(usuario.getCorreo(), rol, availableRoles);
    }

    private List<String> resolverRolesDisponibles(Usuario usuario) {
        java.util.LinkedHashSet<String> roles = new java.util.LinkedHashSet<>();
        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            roles.add(usuario.getRol().getNombre().trim().toUpperCase());
        }
        if (usuario.getRoles() != null) {
            for (com.fastgo.entity.Rol r : usuario.getRoles()) {
                if (r != null && r.getNombre() != null) {
                    roles.add(r.getNombre().trim().toUpperCase());
                }
            }
        }
        if (roles.isEmpty()) {
            roles.add("CLIENTE");
        }
        return new java.util.ArrayList<>(roles);
    }

    public String solicitarRecuperacionPassword(String correo) {
        final String mensajeGenerico = "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.";
        if (correo == null || correo.isBlank()) {
            return mensajeGenerico;
        }

        String correoNorm = correo.trim().toLowerCase();
        java.util.Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correoNorm);

        if (usuarioOpt.isEmpty()) {
            return mensajeGenerico;
        }

        Usuario usuario = usuarioOpt.get();
        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            return mensajeGenerico;
        }

        // Invalidar tokens previos sin utilizar para este usuario
        java.util.List<com.fastgo.entity.PasswordResetToken> previos =
                passwordResetTokenRepository.findByUsuarioAndUtilizadoFalse(usuario);
        for (com.fastgo.entity.PasswordResetToken p : previos) {
            p.setUtilizado(true);
            passwordResetTokenRepository.save(p);
        }

        // Generar nuevo token seguro con expiración de 60 minutos
        String token = java.util.UUID.randomUUID().toString();
        java.time.LocalDateTime expiraEn = java.time.LocalDateTime.now().plusMinutes(60);

        com.fastgo.entity.PasswordResetToken resetToken =
                new com.fastgo.entity.PasswordResetToken(usuario, token, expiraEn);
        passwordResetTokenRepository.save(resetToken);

        emailService.enviarCorreoRecuperacion(usuario.getCorreo(), usuario.getNombre(), token);

        return mensajeGenerico;
    }

    public String resetearPassword(String token, String nuevaPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("El token de recuperación es obligatorio");
        }
        if (nuevaPassword == null || nuevaPassword.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }

        com.fastgo.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUtilizadoFalse(token.trim())
                .orElseThrow(() -> new IllegalArgumentException("El token es inválido o ya ha sido utilizado"));

        if (resetToken.getExpiraEn().isBefore(java.time.LocalDateTime.now())) {
            resetToken.setUtilizado(true);
            passwordResetTokenRepository.save(resetToken);
            throw new IllegalArgumentException("El token ha expirado. Por favor solicita uno nuevo.");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        resetToken.setUtilizado(true);
        passwordResetTokenRepository.save(resetToken);

        return "Contraseña actualizada correctamente.";
    }
}
