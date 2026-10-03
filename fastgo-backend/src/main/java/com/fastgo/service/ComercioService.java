package com.fastgo.service;

import com.fastgo.dto.AdminTiendaResponseDTO;
import com.fastgo.dto.ComercioRequestDTO;
import com.fastgo.dto.ComercioResponseDTO;
import com.fastgo.entity.*;
import com.fastgo.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
public class ComercioService {

    private final ComercioRepository comercioRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaComercioRepository categoriaRepository;
    private final SucursalRepository sucursalRepository;
    private final SuscripcionService suscripcionService;
    private final AuditoriaAdminRepository auditoriaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final MunicipioRepository municipioRepository;
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;

    public ComercioService(
            ComercioRepository c,
            UsuarioRepository u,
            CategoriaComercioRepository cat,
            SucursalRepository suc,
            SuscripcionService suscripcionService,
            AuditoriaAdminRepository auditoriaRepository,
            DepartamentoRepository departamentoRepository,
            MunicipioRepository municipioRepository,
            ProductoRepository productoRepository,
            PedidoRepository pedidoRepository) {
        this.comercioRepository = c;
        this.usuarioRepository = u;
        this.categoriaRepository = cat;
        this.sucursalRepository = suc;
        this.suscripcionService = suscripcionService;
        this.auditoriaRepository = auditoriaRepository;
        this.departamentoRepository = departamentoRepository;
        this.municipioRepository = municipioRepository;
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public List<ComercioResponseDTO> listarComercios() {
        return listarComerciosFiltrados(null, null);
    }

    public List<ComercioResponseDTO> listarComerciosFiltrados(String departamentoParam, String municipioParam) {
        final Integer depTargetId = resolverDepartamentoId(departamentoParam);
        final Integer munTargetId = resolverMunicipioId(municipioParam);

        return comercioRepository.findByActivoTrue().stream()
                .filter(Comercio::isOperativa)
                .filter(c -> {
                    if (depTargetId != null) {
                        boolean matchComercio = depTargetId.equals(c.getDepartamentoId());
                        boolean matchSucursal = sucursalRepository.findByComercioId(c.getId()).stream()
                                .anyMatch(s -> depTargetId.equals(s.getDepartamentoId()));
                        if (!matchComercio && !matchSucursal) return false;
                    }
                    if (munTargetId != null) {
                        boolean matchComercio = munTargetId.equals(c.getMunicipioId());
                        boolean matchSucursal = sucursalRepository.findByComercioId(c.getId()).stream()
                                .anyMatch(s -> munTargetId.equals(s.getMunicipioId()));
                        if (!matchComercio && !matchSucursal) return false;
                    }
                    return true;
                })
                .map(this::dto)
                .toList();
    }

    private Integer resolverDepartamentoId(String input) {
        if (input == null || input.isBlank()) return null;
        try {
            Integer id = Integer.parseInt(input.trim());
            if (departamentoRepository.existsById(id)) return id;
        } catch (NumberFormatException ignored) {}
        return departamentoRepository.findByCodigoDane(input.trim())
                .map(Departamento::getId)
                .orElse(null);
    }

    private Integer resolverMunicipioId(String input) {
        if (input == null || input.isBlank()) return null;
        try {
            Integer id = Integer.parseInt(input.trim());
            if (municipioRepository.existsById(id)) return id;
        } catch (NumberFormatException ignored) {}
        return municipioRepository.findByCodigoDane(input.trim())
                .map(Municipio::getId)
                .orElse(null);
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

    public List<ComercioResponseDTO> listarMisTiendas() {
        Usuario u = usuario();
        return comercioRepository.findAllByUsuarioIdOrderByCreadoEnAsc(u.getId()).stream()
                .map(this::dto)
                .toList();
    }

    public ComercioResponseDTO buscarPropioPorId(Integer id) {
        Usuario u = usuario();
        return dto(propio(id, u));
    }

    @Transactional
    public ComercioResponseDTO guardar(ComercioRequestDTO d) {
        if (d == null) throw new IllegalArgumentException("Los datos del comercio son obligatorios");
        Usuario u = usuario();
        exigirComercio(u);

        ConfiguracionSuscripcion config = suscripcionService.obtenerConfiguracion();
        if (!Boolean.TRUE.equals(config.getAllowNewStores()) && !u.hasRole("ADMIN")) {
            throw new RuntimeException("El registro de nuevas tiendas está temporalmente deshabilitado por administración");
        }

        List<Comercio> misTiendas = comercioRepository.findAllByUsuarioIdOrderByCreadoEnAsc(u.getId());
        int maxGratis = config.getFreePrimaryStores() != null ? config.getFreePrimaryStores() : 1;
        boolean esPrincipal = misTiendas.size() < maxGratis;

        Comercio c = new Comercio();
        c.setUsuario(u);
        c.setEsPrincipal(esPrincipal);
        if (esPrincipal) {
            c.setEstado("ACTIVA");
            if (d.getActivo() == null) {
                c.setActivo(true);
            } else {
                c.setActivo(d.getActivo());
            }
        } else {
            c.setEstado("PENDIENTE_ACTIVACION");
            c.setActivo(false);
        }

        copiar(d, c);
        if (!esPrincipal) {
            c.setEstado("PENDIENTE_ACTIVACION");
            c.setActivo(false);
        }

        Comercio saved = comercioRepository.save(c);

        suscripcionService.crearSuscripcionInicial(saved, esPrincipal, u.getCorreo());

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(saved.getId());
        if (sucursales.isEmpty()) {
            Sucursal s = new Sucursal();
            s.setComercioId(saved.getId());
            s.setNombre("Sede Principal");
            s.setDireccion((d.getDireccion() != null && !d.getDireccion().isBlank()) ? d.getDireccion().trim() : "Dirección principal");
            s.setCiudad((d.getCiudad() != null && !d.getCiudad().isBlank()) ? d.getCiudad().trim() : "Bogotá");
            s.setDepartamento("Cundinamarca");
            Integer depId = resolverDepartamentoId(d.getDepartamentoId());
            if (depId != null) {
                s.setDepartamentoId(depId);
                departamentoRepository.findById(depId).ifPresent(dep -> s.setDepartamento(dep.getNombre()));
            }
            Integer munId = resolverMunicipioId(d.getMunicipioId());
            if (munId != null) {
                s.setMunicipioId(munId);
                municipioRepository.findById(munId).ifPresent(mun -> s.setCiudad(mun.getNombre()));
            }
            s.setTelefono(saved.getTelefono());
            s.setAbierta(true);
            sucursalRepository.save(s);
        }

        return dto(saved);
    }

    @Transactional
    public ComercioResponseDTO actualizar(Integer id, ComercioRequestDTO d) {
        if (d == null) throw new IllegalArgumentException("Los datos del comercio son obligatorios");
        Usuario u = usuario();
        Comercio c = propio(id, u);
        copiar(d, c);

        if (!c.isOperativa()) {
            c.setActivo(false);
        }

        Comercio saved = comercioRepository.save(c);

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(saved.getId());
        if (sucursales.isEmpty()) {
            Sucursal s = new Sucursal();
            s.setComercioId(saved.getId());
            s.setNombre("Sede Principal");
            s.setDireccion((d.getDireccion() != null && !d.getDireccion().isBlank()) ? d.getDireccion().trim() : "Dirección principal");
            s.setCiudad((d.getCiudad() != null && !d.getCiudad().isBlank()) ? d.getCiudad().trim() : "Bogotá");
            s.setDepartamento("Cundinamarca");
            Integer depId = resolverDepartamentoId(d.getDepartamentoId());
            if (depId != null) {
                s.setDepartamentoId(depId);
                departamentoRepository.findById(depId).ifPresent(dep -> s.setDepartamento(dep.getNombre()));
            }
            Integer munId = resolverMunicipioId(d.getMunicipioId());
            if (munId != null) {
                s.setMunicipioId(munId);
                municipioRepository.findById(munId).ifPresent(mun -> s.setCiudad(mun.getNombre()));
            }
            s.setTelefono(saved.getTelefono());
            s.setAbierta(true);
            sucursalRepository.save(s);
        } else {
            Sucursal s = sucursales.get(0);
            if (d.getDireccion() != null && !d.getDireccion().isBlank()) {
                s.setDireccion(d.getDireccion().trim());
            }
            if (d.getCiudad() != null && !d.getCiudad().isBlank()) {
                s.setCiudad(d.getCiudad().trim());
            }
            Integer depId = resolverDepartamentoId(d.getDepartamentoId());
            if (depId != null) {
                s.setDepartamentoId(depId);
                departamentoRepository.findById(depId).ifPresent(dep -> s.setDepartamento(dep.getNombre()));
            }
            Integer munId = resolverMunicipioId(d.getMunicipioId());
            if (munId != null) {
                s.setMunicipioId(munId);
                municipioRepository.findById(munId).ifPresent(mun -> s.setCiudad(mun.getNombre()));
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

    public List<AdminTiendaResponseDTO> listarTodasAdmin() {
        return comercioRepository.findAll().stream()
                .map(this::toAdminDTO)
                .toList();
    }

    @Transactional
    public AdminTiendaResponseDTO activarTiendaAdmin(Integer id, String razon) {
        Usuario admin = usuario();
        Comercio c = comercioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado con id: " + id));
        String estadoAnterior = c.getEstado();
        c.setEstado("ACTIVA");
        c.setActivo(true);
        Comercio saved = comercioRepository.save(c);

        suscripcionService.activarTienda(saved, admin.getCorreo());

        auditoriaRepository.save(new AuditoriaAdmin(
                admin.getCorreo(),
                "ACTIVAR_TIENDA",
                "COMERCIO",
                String.valueOf(id),
                estadoAnterior,
                "ACTIVA",
                razon != null && !razon.isBlank() ? razon : "Activación administrativa de tienda"
        ));

        return toAdminDTO(saved);
    }

    @Transactional
    public AdminTiendaResponseDTO desactivarTiendaAdmin(Integer id, String razon) {
        Usuario admin = usuario();
        Comercio c = comercioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado con id: " + id));
        String estadoAnterior = c.getEstado();
        c.setEstado("DESACTIVADA");
        c.setActivo(false);
        Comercio saved = comercioRepository.save(c);

        auditoriaRepository.save(new AuditoriaAdmin(
                admin.getCorreo(),
                "DESACTIVAR_TIENDA",
                "COMERCIO",
                String.valueOf(id),
                estadoAnterior,
                "DESACTIVADA",
                razon != null && !razon.isBlank() ? razon : "Desactivación administrativa de tienda"
        ));

        return toAdminDTO(saved);
    }

    @Transactional
    public AdminTiendaResponseDTO suspenderTiendaAdmin(Integer id, String razon) {
        Usuario admin = usuario();
        Comercio c = comercioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado con id: " + id));
        String estadoAnterior = c.getEstado();
        c.setEstado("SUSPENDIDA");
        c.setActivo(false);
        Comercio saved = comercioRepository.save(c);

        auditoriaRepository.save(new AuditoriaAdmin(
                admin.getCorreo(),
                "SUSPENDER_TIENDA",
                "COMERCIO",
                String.valueOf(id),
                estadoAnterior,
                "SUSPENDIDA",
                razon != null && !razon.isBlank() ? razon : "Suspensión administrativa por infracción o mora"
        ));

        return toAdminDTO(saved);
    }

    @Transactional
    public AdminTiendaResponseDTO reactivarTiendaAdmin(Integer id, String razon) {
        Usuario admin = usuario();
        Comercio c = comercioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado con id: " + id));
        String estadoAnterior = c.getEstado();
        c.setEstado("ACTIVA");
        c.setActivo(true);
        Comercio saved = comercioRepository.save(c);

        suscripcionService.activarTienda(saved, admin.getCorreo());

        auditoriaRepository.save(new AuditoriaAdmin(
                admin.getCorreo(),
                "REACTIVAR_TIENDA",
                "COMERCIO",
                String.valueOf(id),
                estadoAnterior,
                "ACTIVA",
                razon != null && !razon.isBlank() ? razon : "Reactivación administrativa de tienda"
        ));

        return toAdminDTO(saved);
    }

    @Transactional
    public AdminTiendaResponseDTO eliminarTiendaAdmin(Integer id, String razon) {
        Usuario admin = usuario();
        Comercio c = comercioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comercio no encontrado con id: " + id));
        String estadoAnterior = c.getEstado();
        c.setEstado("ELIMINADA");
        c.setActivo(false);
        Comercio saved = comercioRepository.save(c);

        auditoriaRepository.save(new AuditoriaAdmin(
                admin.getCorreo(),
                "ELIMINAR_TIENDA",
                "COMERCIO",
                String.valueOf(id),
                estadoAnterior,
                "ELIMINADA",
                razon != null && !razon.isBlank() ? razon : "Eliminación lógica administrativa de tienda"
        ));

        return toAdminDTO(saved);
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
        if (d.getTarifaDomicilio() != null) {
            if (d.getTarifaDomicilio().compareTo(java.math.BigDecimal.valueOf(2000)) < 0) {
                throw new IllegalArgumentException("La tarifa de domicilio mínima es de $2.000 COP");
            }
            c.setTarifaDomicilio(d.getTarifaDomicilio());
        } else if (c.getTarifaDomicilio() == null) {
            c.setTarifaDomicilio(java.math.BigDecimal.valueOf(2000));
        }
        if (d.getBancolombiaActivo() != null) {
            c.setBancolombiaActivo(d.getBancolombiaActivo());
            if (Boolean.TRUE.equals(d.getBancolombiaActivo())) {
                if (d.getBancolombiaNumeroCuenta() == null || d.getBancolombiaNumeroCuenta().isBlank()) {
                    throw new IllegalArgumentException("El número de cuenta Bancolombia es obligatorio si el método está activo");
                }
                if (d.getBancolombiaTitular() == null || d.getBancolombiaTitular().isBlank()) {
                    throw new IllegalArgumentException("El titular de la cuenta Bancolombia es obligatorio si el método está activo");
                }
            }
        }
        if (d.getBancolombiaTipoCuenta() != null) {
            c.setBancolombiaTipoCuenta(d.getBancolombiaTipoCuenta().trim());
        }
        if (d.getBancolombiaNumeroCuenta() != null) {
            c.setBancolombiaNumeroCuenta(d.getBancolombiaNumeroCuenta().trim());
        }
        if (d.getBancolombiaTitular() != null) {
            c.setBancolombiaTitular(d.getBancolombiaTitular().trim());
        }
        if (d.getBancolombiaDocTitular() != null) {
            c.setBancolombiaDocTitular(d.getBancolombiaDocTitular().trim());
        }
        Integer depId = resolverDepartamentoId(d.getDepartamentoId());
        if (depId != null) {
            c.setDepartamentoId(depId);
        }
        Integer munId = resolverMunicipioId(d.getMunicipioId());
        if (munId != null) {
            c.setMunicipioId(munId);
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

    private AdminTiendaResponseDTO toAdminDTO(Comercio c) {
        AdminTiendaResponseDTO dto = new AdminTiendaResponseDTO();
        dto.setId(c.getId());
        dto.setNombre(c.getNombre());
        dto.setDescripcion(c.getDescripcion());
        dto.setTelefono(c.getTelefono());
        dto.setEsPrincipal(c.getEsPrincipal());
        dto.setEstado(c.getEstado());
        dto.setActivo(c.getActivo());
        dto.setFechaCreacion(c.getCreadoEn());

        if (c.getUsuario() != null) {
            dto.setUsuarioId(c.getUsuario().getId());
            dto.setPropietarioNombre(c.getUsuario().getNombre());
            dto.setPropietarioCorreo(c.getUsuario().getCorreo());
            dto.setPropietarioTelefono(c.getUsuario().getTelefono());
        }

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(c.getId());
        if (!sucursales.isEmpty()) {
            dto.setDireccion(sucursales.get(0).getDireccion());
            dto.setCiudad(sucursales.get(0).getCiudad());
        }

        dto.setDepartamentoId(c.getDepartamentoId() != null ? String.valueOf(c.getDepartamentoId()) : null);
        if (c.getDepartamentoId() != null) {
            departamentoRepository.findById(c.getDepartamentoId()).ifPresent(d -> dto.setDepartamentoNombre(d.getNombre()));
        }
        dto.setMunicipioId(c.getMunicipioId() != null ? String.valueOf(c.getMunicipioId()) : null);
        if (c.getMunicipioId() != null) {
            municipioRepository.findById(c.getMunicipioId()).ifPresent(m -> dto.setMunicipioNombre(m.getNombre()));
        }

        long prodCount = 0;
        long pedCount = 0;
        for (Sucursal s : sucursales) {
            prodCount += productoRepository.countBySucursalId(s.getId());
            pedCount += pedidoRepository.countBySucursalId(s.getId());
        }
        dto.setTotalProductos(prodCount);
        dto.setTotalPedidos(pedCount);

        suscripcionService.obtenerUltimaSuscripcion(c.getId()).ifPresent(sub -> {
            dto.setTipoPlan(sub.getTipoPlan());
            dto.setEstadoSuscripcion(sub.getEstado());
            dto.setFechaInicioSuscripcion(sub.getFechaInicio());
            dto.setFechaVencimiento(sub.getFechaFin());
            dto.setMontoSuscripcion(sub.getMonto());
            dto.setFechaUltimoPago(sub.getFechaPago());
            dto.setReferenciaPago(sub.getReferenciaPago());
        });

        return dto;
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
        r.setDentroDeHorario(c.isDentroDeHorario());
        r.setMensajeEstado(c.getMensajeEstado());

        r.setTarifaDomicilio(c.getTarifaDomicilio());
        r.setBancolombiaActivo(c.getBancolombiaActivo());
        r.setBancolombiaTipoCuenta(c.getBancolombiaTipoCuenta());
        r.setBancolombiaNumeroCuenta(c.getBancolombiaNumeroCuenta());
        r.setBancolombiaTitular(c.getBancolombiaTitular());
        r.setBancolombiaDocTitular(c.getBancolombiaDocTitular());

        r.setEsPrincipal(c.getEsPrincipal());
        r.setEstado(c.getEstado());
        r.setCreadoEn(c.getCreadoEn());

        if (c.getUsuario() != null) {
            r.setUsuarioId(c.getUsuario().getId());
            r.setUsuarioNombre(c.getUsuario().getNombre());
            r.setUsuarioCorreo(c.getUsuario().getCorreo());
        }

        suscripcionService.obtenerUltimaSuscripcion(c.getId()).ifPresent(sub -> {
            r.setFechaInicioSuscripcion(sub.getFechaInicio());
            r.setFechaFinSuscripcion(sub.getFechaFin());
            r.setTipoPlan(sub.getTipoPlan());
            r.setEstadoSuscripcion(sub.getEstado());
            r.setPrecioMensual(sub.getMonto());
            boolean gratuito = "GRATUITO".equalsIgnoreCase(sub.getEstado()) ||
                    ("TIENDA_PRINCIPAL".equalsIgnoreCase(sub.getTipoPlan()) && (sub.getMonto() == null || sub.getMonto().compareTo(BigDecimal.ZERO) == 0));
            r.setEsGratuito(gratuito);
        });

        List<Sucursal> sucursales = sucursalRepository.findByComercioId(c.getId());
        if (!sucursales.isEmpty()) {
            Sucursal s = sucursales.get(0);
            r.setDireccion(s.getDireccion());
            r.setCiudad(s.getCiudad());
        }

        r.setDepartamentoId(c.getDepartamentoId() != null ? String.valueOf(c.getDepartamentoId()) : null);
        if (c.getDepartamentoId() != null) {
            departamentoRepository.findById(c.getDepartamentoId()).ifPresent(d -> r.setDepartamentoNombre(d.getNombre()));
        }
        r.setMunicipioId(c.getMunicipioId() != null ? String.valueOf(c.getMunicipioId()) : null);
        if (c.getMunicipioId() != null) {
            municipioRepository.findById(c.getMunicipioId()).ifPresent(m -> r.setMunicipioNombre(m.getNombre()));
        }

        return r;
    }
}
