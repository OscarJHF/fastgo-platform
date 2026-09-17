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

        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

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

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setCorreo(correo);
        usuario.setTelefono(telefono == null || telefono.isBlank() ? null : telefono);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setFoto(request.getFoto());
        usuario.setRol(rolAsignar);
        usuario.setEstado(true);

        return toDto(usuarioRepository.save(usuario));
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

        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getFoto(),
                usuario.getEstado(),
                usuario.getRol() != null
                        ? usuario.getRol().getNombre()
                        : ""
        );
    }
}
