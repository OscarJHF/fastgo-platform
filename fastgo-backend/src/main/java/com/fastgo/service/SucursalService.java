package com.fastgo.service;

import com.fastgo.dto.SucursalRequestDTO;
import com.fastgo.entity.Comercio;
import com.fastgo.entity.Sucursal;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.ComercioRepository;
import com.fastgo.repository.SucursalRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SucursalService {

    private final SucursalRepository sucursalRepository;
    private final ComercioRepository comercioRepository;
    private final UsuarioRepository usuarioRepository;

    public SucursalService(
            SucursalRepository sucursalRepository,
            ComercioRepository comercioRepository,
            UsuarioRepository usuarioRepository) {
        this.sucursalRepository = sucursalRepository;
        this.comercioRepository = comercioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Sucursal> listarPorComercio(Integer comercioId) {
        return sucursalRepository.findByComercioId(comercioId);
    }

    public List<Sucursal> listarAbiertas() {
        return sucursalRepository.findByAbiertaTrue();
    }

    public Sucursal obtener(Integer id) {
        return sucursalRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Sucursal no encontrada"));
    }

    public Sucursal crear(SucursalRequestDTO datos) {

        if (datos == null) {
            throw new RuntimeException("Los datos son obligatorios");
        }

        Usuario usuario = usuario();
        Comercio comercio =
                obtenerComercioPropio(datos.getComercioId(), usuario);

        validar(datos);

        Sucursal sucursal = new Sucursal();
        sucursal.setComercioId(comercio.getId());
        copiarDatos(datos, sucursal);

        return sucursalRepository.save(sucursal);
    }

    public Sucursal actualizar(
            Integer id,
            SucursalRequestDTO datos) {

        if (datos == null) {
            throw new RuntimeException("Los datos son obligatorios");
        }

        Usuario usuario = usuario();

        Sucursal sucursal = obtener(id);

        obtenerComercioPropio(sucursal.getComercioId(), usuario);

        validar(datos);

        copiarDatos(datos, sucursal);

        return sucursalRepository.save(sucursal);
    }

    public void eliminar(Integer id) {

        Usuario usuario = usuario();
        Sucursal sucursal = obtener(id);

        obtenerComercioPropio(sucursal.getComercioId(), usuario);

        sucursalRepository.delete(sucursal);
    }

    private Comercio obtenerComercioPropio(
            Integer comercioId,
            Usuario usuario) {

        if (comercioId == null) {
            throw new RuntimeException(
                    "El comercio es obligatorio");
        }

        return comercioRepository
                .findByIdAndUsuarioId(
                        comercioId,
                        usuario.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Comercio no encontrado o no pertenece al usuario"));
    }

    private void validar(SucursalRequestDTO datos) {

        if (datos.getNombre() == null
                || datos.getNombre().isBlank()) {
            throw new RuntimeException(
                    "El nombre de la sucursal es obligatorio");
        }

        if (datos.getDireccion() == null
                || datos.getDireccion().isBlank()) {
            throw new RuntimeException(
                    "La dirección de la sucursal es obligatoria");
        }

        if (datos.getCiudad() == null
                || datos.getCiudad().isBlank()) {
            throw new RuntimeException(
                    "La ciudad de la sucursal es obligatoria");
        }

        if (datos.getRadioEntregaKm() != null
                && datos.getRadioEntregaKm()
                .compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "El radio de entrega debe ser mayor que cero");
        }
    }

    private void copiarDatos(
            SucursalRequestDTO datos,
            Sucursal sucursal) {

        sucursal.setNombre(datos.getNombre());
        sucursal.setDireccion(datos.getDireccion());
        sucursal.setCiudad(datos.getCiudad());
        sucursal.setDepartamento(datos.getDepartamento());
        sucursal.setTelefono(datos.getTelefono());
        sucursal.setLatitud(datos.getLatitud());
        sucursal.setLongitud(datos.getLongitud());

        if (datos.getRadioEntregaKm() != null) {
            sucursal.setRadioEntregaKm(
                    datos.getRadioEntregaKm());
        }

        if (datos.getAbierta() != null) {
            sucursal.setAbierta(datos.getAbierta());
        }
    }

    private Usuario usuario() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new RuntimeException(
                    "Usuario no autenticado");
        }

        return usuarioRepository.findByCorreo(
                        authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuario autenticado no encontrado"));
    }
}
