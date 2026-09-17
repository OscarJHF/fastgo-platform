package com.fastgo.service;

import com.fastgo.dto.UsuarioResponseDTO;
import com.fastgo.dto.RegistroUsuarioRequest;
import com.fastgo.entity.Rol;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.RolRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolRepository rolRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolRepository = rolRepository;
    }

    public List<UsuarioResponseDTO> listarUsuarios() {

        return usuarioRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public UsuarioResponseDTO registrarCliente(RegistroUsuarioRequest request) {

        String correo = request.getCorreo().trim().toLowerCase();

        String telefono = request.getTelefono() == null
                ? null
                : request.getTelefono().trim();

        String requestedRol = request.getRol() == null || request.getRol().isBlank()
                ? "CLIENTE"
                : request.getRol().trim().toUpperCase();

        if ("ADMIN".equals(requestedRol) || "ADMINISTRADOR".equals(requestedRol)) {
            throw new IllegalArgumentException("No está permitido registrarse con rol de Administrador");
        }

        if (!"CLIENTE".equals(requestedRol) && !"COMERCIO".equals(requestedRol) && !"DOMICILIARIO".equals(requestedRol)) {
            throw new IllegalArgumentException("Rol no válido. Roles permitidos: CLIENTE, COMERCIO, DOMICILIARIO");
        }

        Rol rolAsignar = rolRepository.findByNombreIgnoreCase(requestedRol)
                .orElseThrow(() -> new IllegalStateException("Rol " + requestedRol + " no configurado"));

        java.util.Optional<Usuario> existenteOpt = usuarioRepository.findByCorreo(correo);

        if (existenteOpt.isPresent()) {
            Usuario usuario = existenteOpt.get();
            if (usuario.hasRole(requestedRol)) {
                throw new IllegalArgumentException("El usuario ya tiene una cuenta registrada con el rol " + requestedRol);
            }

            if (request.getNombre() != null && !request.getNombre().trim().isBlank()) {
                usuario.setNombre(request.getNombre().trim());
            }
            if (request.getApellido() != null && !request.getApellido().trim().isBlank()) {
                usuario.setApellido(request.getApellido().trim());
            }
            if (telefono != null && !telefono.isBlank()) {
                usuario.setTelefono(telefono);
            }
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                usuario.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            usuario.getRoles().add(rolAsignar);
            usuario.setRol(rolAsignar); // Rol recién registrado pasa a ser el activo
            return toDto(usuarioRepository.save(usuario));
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre() != null ? request.getNombre().trim() : "");
        usuario.setApellido(request.getApellido() != null ? request.getApellido().trim() : "");
        usuario.setCorreo(correo);
        usuario.setTelefono(telefono == null || telefono.isBlank() ? null : telefono);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setFoto(request.getFoto());
        usuario.setRol(rolAsignar);
        usuario.getRoles().add(rolAsignar);
        usuario.setEstado(true);

        return toDto(usuarioRepository.save(usuario));
    }

    public com.fastgo.dto.DatosUsuarioReutilizablesDTO obtenerDatosReutilizables(String correo) {
        if (correo == null || correo.isBlank()) {
            return new com.fastgo.dto.DatosUsuarioReutilizablesDTO(null, null, "", null, List.of());
        }
        String c = correo.trim().toLowerCase();
        java.util.Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(c);
        if (usuarioOpt.isEmpty()) {
            return new com.fastgo.dto.DatosUsuarioReutilizablesDTO(null, null, c, null, List.of());
        }
        Usuario base = usuarioOpt.get();
        java.util.LinkedHashSet<String> roles = new java.util.LinkedHashSet<>();
        if (base.getRol() != null && base.getRol().getNombre() != null) {
            roles.add(base.getRol().getNombre().trim().toUpperCase());
        }
        if (base.getRoles() != null) {
            for (Rol r : base.getRoles()) {
                if (r != null && r.getNombre() != null) {
                    roles.add(r.getNombre().trim().toUpperCase());
                }
            }
        }
        return new com.fastgo.dto.DatosUsuarioReutilizablesDTO(
                base.getNombre(), base.getApellido(), c, base.getTelefono(), new java.util.ArrayList<>(roles));
    }

    public UsuarioResponseDTO obtenerUsuarioActual() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new RuntimeException("Usuario no autenticado");
        }

        Usuario usuario = usuarioRepository
                .findByCorreo(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario no encontrado"));

        return toDto(usuario);
    }

    private UsuarioResponseDTO toDto(Usuario usuario) {
        String activeRole = usuario.getRol() != null ? usuario.getRol().getNombre().trim().toUpperCase() : "CLIENTE";
        java.util.LinkedHashSet<String> rolesSet = new java.util.LinkedHashSet<>();
        rolesSet.add(activeRole);
        if (usuario.getRoles() != null) {
            for (Rol r : usuario.getRoles()) {
                if (r != null && r.getNombre() != null) {
                    rolesSet.add(r.getNombre().trim().toUpperCase());
                }
            }
        }
        List<String> available = new java.util.ArrayList<>(rolesSet);

        UsuarioResponseDTO dto = new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getFoto(),
                usuario.getEstado(),
                activeRole
        );
        dto.setActiveRole(activeRole);
        dto.setAvailableRoles(available);
        return dto;
    }
}
