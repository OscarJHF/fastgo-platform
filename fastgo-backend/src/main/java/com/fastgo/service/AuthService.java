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

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            com.fastgo.repository.RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rolRepository = rolRepository;
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
}
