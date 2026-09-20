package com.fastgo.service;

import com.fastgo.dto.ComercioRequestDTO;
import com.fastgo.dto.ComercioResponseDTO;
import com.fastgo.entity.CategoriaComercio;
import com.fastgo.entity.Comercio;
import com.fastgo.entity.Sucursal;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.CategoriaComercioRepository;
import com.fastgo.repository.ComercioRepository;
import com.fastgo.repository.SucursalRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class ComercioService {

    private final ComercioRepository comercioRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaComercioRepository categoriaRepository;
    private final SucursalRepository sucursalRepository;

    public ComercioService(
            ComercioRepository c,
            UsuarioRepository u,
            CategoriaComercioRepository cat,
            SucursalRepository suc) {
        this.comercioRepository = c;
        this.usuarioRepository = u;
        this.categoriaRepository = cat;
        this.sucursalRepository = suc;
    }

    public List<ComercioResponseDTO> listarComercios() {
        return comercioRepository.findByActivoTrue().stream().map(this::dto).toList();
    }

    public ComercioResponseDTO buscarPorId(Integer id) {
        return dto(comercioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado")));
    }

    public ComercioResponseDTO buscarPropio() {
        Usuario u = usuario();
        return comercioRepository.findByUsuarioId(u.getId())
                .map(this::dto)
                .orElse(null);
    }

    public ComercioResponseDTO guardar(ComercioRequestDTO d) {
        if (d == null) throw new IllegalArgumentException("Los datos del comercio son obligatorios");
        Usuario u = usuario();
        exigirComercio(u);
        if (comercioRepository.findByUsuarioId(u.getId()).isPresent()) {
            throw new RuntimeException("El usuario ya tiene un comercio registrado");
        }
        Comercio c = new Comercio();
        c.setUsuario(u);
        copiar(d, c);
        Comercio saved = comercioRepository.save(c);

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(saved.getId());
        if (sucursales.isEmpty()) {
            Sucursal s = new Sucursal();
            s.setComercioId(saved.getId());
            s.setNombre("Sede Principal");
            s.setDireccion((d.getDireccion() != null && !d.getDireccion().isBlank()) ? d.getDireccion().trim() : "Dirección principal");
            s.setCiudad((d.getCiudad() != null && !d.getCiudad().isBlank()) ? d.getCiudad().trim() : "Bogotá");
            s.setDepartamento("Cundinamarca");
            s.setTelefono(saved.getTelefono());
            s.setAbierta(true);
            sucursalRepository.save(s);
        }

        return dto(saved);
    }

    public ComercioResponseDTO actualizar(Integer id, ComercioRequestDTO d) {
        if (d == null) throw new IllegalArgumentException("Los datos del comercio son obligatorios");
        Usuario u = usuario();
        Comercio c = propio(id, u);
        copiar(d, c);
        Comercio saved = comercioRepository.save(c);

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(saved.getId());
        if (sucursales.isEmpty()) {
            Sucursal s = new Sucursal();
            s.setComercioId(saved.getId());
            s.setNombre("Sede Principal");
            s.setDireccion((d.getDireccion() != null && !d.getDireccion().isBlank()) ? d.getDireccion().trim() : "Dirección principal");
            s.setCiudad((d.getCiudad() != null && !d.getCiudad().isBlank()) ? d.getCiudad().trim() : "Bogotá");
            s.setDepartamento("Cundinamarca");
            s.setTelefono(saved.getTelefono());
            s.setAbierta(true);
            sucursalRepository.save(s);
        } else if ((d.getDireccion() != null && !d.getDireccion().isBlank()) || (d.getCiudad() != null && !d.getCiudad().isBlank())) {
            Sucursal s = sucursales.get(0);
            if (d.getDireccion() != null && !d.getDireccion().isBlank()) {
                s.setDireccion(d.getDireccion().trim());
            }
            if (d.getCiudad() != null && !d.getCiudad().isBlank()) {
                s.setCiudad(d.getCiudad().trim());
            }
            if (saved.getTelefono() != null) {
                s.setTelefono(saved.getTelefono());
            }
            sucursalRepository.save(s);
        }

        return dto(saved);
    }

    public ComercioResponseDTO togglePausaManual(Integer id) {
        Usuario u = usuario();
        Comercio c = propio(id, u);
        c.setPausaManual(!Boolean.TRUE.equals(c.getPausaManual()));
        return dto(comercioRepository.save(c));
    }

    public void eliminar(Integer id) {
        Usuario u = usuario();
        comercioRepository.delete(propio(id, u));
    }

    public Comercio obtenerEntidadPropia(Integer id) {
        return propio(id, usuario());
    }

    private void copiar(ComercioRequestDTO d, Comercio c) {
        if (d.getNombre() == null || d.getNombre().isBlank()) {
            throw new RuntimeException("El nombre del comercio es obligatorio");
        }
        if (d.getCategoriaId() == null) {
            throw new RuntimeException("La categoría es obligatoria");
        }
        CategoriaComercio cat = categoriaRepository.findById(d.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría de comercio no encontrada"));
        c.setCategoria(cat);
        c.setNombre(d.getNombre());
        c.setDescripcion(d.getDescripcion());
        c.setTelefono(d.getTelefono());
        c.setCorreo(d.getCorreo());
        c.setLogo(d.getLogo());
        c.setBanner(d.getBanner());
        c.setNit(d.getNit());
        if (d.getActivo() != null) c.setActivo(d.getActivo());

        if (d.getMetodosPago() != null && !d.getMetodosPago().isBlank()) {
            c.setMetodosPago(d.getMetodosPago());
        }
        if (d.getHoraApertura() != null && !d.getHoraApertura().isBlank()) {
            try { c.setHoraApertura(LocalTime.parse(d.getHoraApertura().trim())); } catch (Exception ignored) {}
        }
        if (d.getHoraCierre() != null && !d.getHoraCierre().isBlank()) {
            try { c.setHoraCierre(LocalTime.parse(d.getHoraCierre().trim())); } catch (Exception ignored) {}
        }
        if (d.getDiasAtencion() != null && !d.getDiasAtencion().isBlank()) {
            c.setDiasAtencion(d.getDiasAtencion());
        }
        if (d.getTiempoPreparacionMin() != null) {
            c.setTiempoPreparacionMin(d.getTiempoPreparacionMin());
        }
        if (d.getPausaManual() != null) {
            c.setPausaManual(d.getPausaManual());
        }
    }

    private Comercio propio(Integer id, Usuario u) {
        return comercioRepository.findByIdAndUsuarioId(id, u.getId())
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado o no pertenece al usuario"));
    }

    private void exigirComercio(Usuario u) {
        if (!u.hasRole("COMERCIO")) {
            throw new RuntimeException("Solo los usuarios con rol COMERCIO pueden administrar un comercio");
        }
    }

    private Usuario usuario() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated() || a.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return usuarioRepository.findByCorreo(a.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }

    private ComercioResponseDTO dto(Comercio c) {
        ComercioResponseDTO r = new ComercioResponseDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getTelefono(),
                c.getCorreo(),
                c.getLogo(),
                c.getBanner(),
                c.getNit(),
                c.getActivo(),
                c.getCategoria() != null ? c.getCategoria().getNombre() : null
        );
        r.setCategoriaId(c.getCategoria() != null ? c.getCategoria().getId() : null);
        r.setMetodosPago(c.getMetodosPago());
        r.setHoraApertura(c.getHoraApertura() != null ? c.getHoraApertura().toString() : null);
        r.setHoraCierre(c.getHoraCierre() != null ? c.getHoraCierre().toString() : null);
        r.setDiasAtencion(c.getDiasAtencion());
        r.setTiempoPreparacionMin(c.getTiempoPreparacionMin());
        r.setPausaManual(c.getPausaManual());
        r.setAbierto(c.isAbierto());

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(c.getId());
        if (!sucursales.isEmpty()) {
            Sucursal s = sucursales.get(0);
            r.setDireccion(s.getDireccion());
            r.setCiudad(s.getCiudad());
        }

        return r;
    }
}
