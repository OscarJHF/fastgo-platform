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
    private final com.fastgo.repository.AuditoriaAdminRepository auditoriaAdminRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            RolRepository rolRepository,
            com.fastgo.repository.AuditoriaAdminRepository auditoriaAdminRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolRepository = rolRepository;
        this.auditoriaAdminRepository = auditoriaAdminRepository;
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

    @org.springframework.transaction.annotation.Transactional
    public UsuarioResponseDTO modificarUsuarioAdmin(Integer id, com.fastgo.dto.AdminUsuarioModificarRequest request, String adminCorreo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        String nuevoCorreo = request.getCorreo().trim().toLowerCase();
        if (!nuevoCorreo.equalsIgnoreCase(usuario.getCorreo())) {
            java.util.Optional<Usuario> existente = usuarioRepository.findByCorreo(nuevoCorreo);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new IllegalArgumentException("Ya existe una cuenta con el correo: " + nuevoCorreo);
            }
        }

        String valorAnterior = String.format("nombre=%s, apellido=%s, correo=%s, telefono=%s",
                usuario.getNombre(), usuario.getApellido(), usuario.getCorreo(), usuario.getTelefono());

        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido() != null ? request.getApellido().trim() : "");
        usuario.setCorreo(nuevoCorreo);
        usuario.setTelefono(request.getTelefono() != null && !request.getTelefono().isBlank() ? request.getTelefono().trim() : null);

        Usuario saved = usuarioRepository.save(usuario);

        String valorNuevo = String.format("nombre=%s, apellido=%s, correo=%s, telefono=%s",
                saved.getNombre(), saved.getApellido(), saved.getCorreo(), saved.getTelefono());

        auditoriaAdminRepository.save(new com.fastgo.entity.AuditoriaAdmin(
                adminCorreo,
                "MODIFICAR_USUARIO",
                "USUARIO",
                String.valueOf(id),
                valorAnterior,
                valorNuevo,
                "Modificación administrativa de datos de usuario"
        ));

        return toDto(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    public UsuarioResponseDTO cambiarEstadoUsuarioAdmin(Integer id, Boolean nuevoEstado, String motivo, String adminCorreo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        if (Boolean.FALSE.equals(nuevoEstado) && usuario.hasRole("ADMIN")) {
            long adminsActivos = usuarioRepository.findAll().stream()
                    .filter(u -> Boolean.TRUE.equals(u.getEstado()) && u.hasRole("ADMIN"))
                    .count();
            if (adminsActivos <= 1) {
                throw new IllegalStateException("No es posible desactivar al único administrador activo del sistema");
            }
        }

        Boolean estadoAnterior = usuario.getEstado();
        usuario.setEstado(nuevoEstado);
        Usuario saved = usuarioRepository.save(usuario);

        auditoriaAdminRepository.save(new com.fastgo.entity.AuditoriaAdmin(
                adminCorreo,
                Boolean.TRUE.equals(nuevoEstado) ? "ACTIVAR_USUARIO" : "DESACTIVAR_USUARIO",
                "USUARIO",
                String.valueOf(id),
                String.valueOf(estadoAnterior),
                String.valueOf(nuevoEstado),
                motivo != null && !motivo.isBlank() ? motivo : "Cambio administrativo de estado de usuario"
        ));

        return toDto(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    public UsuarioResponseDTO cambiarRolesUsuarioAdmin(Integer id, List<String> nuevosRoles, String adminCorreo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        if (nuevosRoles == null || nuevosRoles.isEmpty()) {
            throw new IllegalArgumentException("El usuario debe tener al menos un rol asignado");
        }

        boolean teniaAdmin = usuario.hasRole("ADMIN");
        boolean tendraAdmin = nuevosRoles.stream().anyMatch(r -> "ADMIN".equalsIgnoreCase(r.trim()) || "ADMINISTRADOR".equalsIgnoreCase(r.trim()));

        if (teniaAdmin && !tendraAdmin) {
            long adminsActivos = usuarioRepository.findAll().stream()
                    .filter(u -> Boolean.TRUE.equals(u.getEstado()) && u.hasRole("ADMIN"))
                    .count();
            if (adminsActivos <= 1) {
                throw new IllegalStateException("No es posible revocar el rol de Administrador al único administrador activo del sistema");
            }
        }

        String rolesAnteriores = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .reduce((a, b) -> a + "," + b)
                .orElse(usuario.getRol() != null ? usuario.getRol().getNombre() : "");

        java.util.Set<Rol> targetRoles = new java.util.HashSet<>();
        Rol primerRol = null;
        for (String rName : nuevosRoles) {
            String clean = rName.trim().toUpperCase();
            Rol r = rolRepository.findByNombreIgnoreCase(clean)
                    .orElseThrow(() -> new IllegalArgumentException("Rol no válido: " + clean));
            targetRoles.add(r);
            if (primerRol == null) {
                primerRol = r;
            }
        }

        usuario.setRoles(targetRoles);
        if (!targetRoles.contains(usuario.getRol())) {
            usuario.setRol(primerRol);
        }

        Usuario saved = usuarioRepository.save(usuario);

        String rolesNuevos = targetRoles.stream()
                .map(Rol::getNombre)
                .reduce((a, b) -> a + "," + b)
                .orElse("");

        auditoriaAdminRepository.save(new com.fastgo.entity.AuditoriaAdmin(
                adminCorreo,
                "CAMBIAR_ROLES_USUARIO",
                "USUARIO",
                String.valueOf(id),
                rolesAnteriores,
                rolesNuevos,
                "Actualización administrativa de roles de usuario"
        ));

        return toDto(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    public java.util.Map<String, String> resetPasswordUsuarioAdmin(Integer id, String adminCorreo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        String tempPassword = generarPasswordSegura();
        usuario.setPassword(passwordEncoder.encode(tempPassword));
        usuarioRepository.save(usuario);

        auditoriaAdminRepository.save(new com.fastgo.entity.AuditoriaAdmin(
                adminCorreo,
                "RESET_PASSWORD_USUARIO",
                "USUARIO",
                String.valueOf(id),
                null,
                null,
                "Restablecimiento administrativo de contraseña con clave temporal generada"
        ));

        return java.util.Map.of(
                "mensaje", "Contraseña restablecida exitosamente",
                "temporalPassword", tempPassword
        );
    }

    private String generarPasswordSegura() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
