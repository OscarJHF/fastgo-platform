package com.fastgo.service;

import com.fastgo.entity.Direccion;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.DireccionRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;

    public DireccionService(
            DireccionRepository direccionRepository,
            UsuarioRepository usuarioRepository) {
        this.direccionRepository = direccionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Direccion crearDireccion(Direccion direccion) {
        if (direccion == null) throw new IllegalArgumentException("Los datos de la dirección son obligatorios");
        validar(direccion);
        Usuario usuario = usuario();

        direccion.setUsuarioId(usuario.getId());

        List<Direccion> actuales =
                direccionRepository.findByUsuarioId(usuario.getId());

        if (actuales.isEmpty()) {
            direccion.setPrincipal(true);
        } else if (direccion.getPrincipal() == null) {
            direccion.setPrincipal(false);
        }

        if (Boolean.TRUE.equals(direccion.getPrincipal())) {
            quitarDireccionPrincipal(usuario.getId());
        }

        return direccionRepository.save(direccion);
    }

    public List<Direccion> listarMisDirecciones() {
        return direccionRepository.findByUsuarioId(
                usuario().getId());
    }

    public Direccion obtenerPorId(Integer id) {
        Usuario usuario = usuario();

        return direccionRepository.findByIdAndUsuarioId(
                        id,
                        usuario.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Dirección no encontrada o no pertenece al usuario"));
    }

    @Transactional
    public Direccion actualizarDireccion(
            Integer id,
            Direccion datos) {

        if (datos == null) throw new IllegalArgumentException("Los datos de la dirección son obligatorios");
        validar(datos);
        Usuario usuario = usuario();

        Direccion direccion =
                obtenerPropia(id, usuario);

        direccion.setAlias(datos.getAlias());
        direccion.setDireccion(datos.getDireccion());
        direccion.setCiudad(datos.getCiudad());
        direccion.setDepartamento(datos.getDepartamento());
        direccion.setCodigoPostal(datos.getCodigoPostal());
        direccion.setLatitud(datos.getLatitud());
        direccion.setLongitud(datos.getLongitud());

        if (Boolean.TRUE.equals(datos.getPrincipal())) {
            quitarDireccionPrincipal(usuario.getId());
            direccion.setPrincipal(true);
        } else {
            direccion.setPrincipal(false);
        }

        return direccionRepository.save(direccion);
    }

    public void eliminarDireccion(Integer id) {
        Usuario usuario = usuario();
        Direccion direccion = obtenerPropia(id, usuario);
        direccionRepository.delete(direccion);
    }

    @Transactional
    public Direccion marcarComoPrincipal(Integer id) {
        Usuario usuario = usuario();
        Direccion direccion = obtenerPropia(id, usuario);

        quitarDireccionPrincipal(usuario.getId());
        direccion.setPrincipal(true);

        return direccionRepository.save(direccion);
    }

    private Direccion obtenerPropia(
            Integer id,
            Usuario usuario) {
        return direccionRepository.findByIdAndUsuarioId(
                        id,
                        usuario.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Dirección no encontrada o no pertenece al usuario"));
    }

    private void quitarDireccionPrincipal(Integer usuarioId) {
        List<Direccion> principales =
                direccionRepository
                        .findByUsuarioIdAndPrincipalTrue(usuarioId);

        for (Direccion direccion : principales) {
            direccion.setPrincipal(false);
            direccionRepository.save(direccion);
        }
    }

    private void validar(Direccion direccion) {
        if (direccion.getAlias() == null || direccion.getAlias().isBlank() || direccion.getAlias().trim().length() > 50)
            throw new IllegalArgumentException("El alias es obligatorio y no puede superar 50 caracteres");
        if (direccion.getDireccion() == null || direccion.getDireccion().isBlank() || direccion.getDireccion().trim().length() > 255)
            throw new IllegalArgumentException("La dirección es obligatoria y no puede superar 255 caracteres");
        if (direccion.getCiudad() == null || direccion.getCiudad().isBlank() || direccion.getCiudad().trim().length() > 100)
            throw new IllegalArgumentException("La ciudad es obligatoria y no puede superar 100 caracteres");

        if (direccion.getLatitud() != null) {
            if (direccion.getLatitud().compareTo(BigDecimal.valueOf(-90)) < 0
                    || direccion.getLatitud().compareTo(BigDecimal.valueOf(90)) > 0) {
                throw new IllegalArgumentException("La latitud debe estar entre -90 y 90 grados");
            }
        }
        if (direccion.getLongitud() != null) {
            if (direccion.getLongitud().compareTo(BigDecimal.valueOf(-180)) < 0
                    || direccion.getLongitud().compareTo(BigDecimal.valueOf(180)) > 0) {
                throw new IllegalArgumentException("La longitud debe estar entre -180 y 180 grados");
            }
        }
    }

    private Usuario usuario() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        return usuarioRepository.findByCorreo(
                        authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario autenticado no encontrado"));
    }
}
