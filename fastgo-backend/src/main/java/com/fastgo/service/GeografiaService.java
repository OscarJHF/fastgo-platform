package com.fastgo.service;

import com.fastgo.dto.DepartamentoDTO;
import com.fastgo.dto.MunicipioDTO;
import com.fastgo.entity.Departamento;
import com.fastgo.entity.Municipio;
import com.fastgo.repository.DepartamentoRepository;
import com.fastgo.repository.MunicipioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GeografiaService {

    private final DepartamentoRepository departamentoRepository;
    private final MunicipioRepository municipioRepository;

    public GeografiaService(
            DepartamentoRepository departamentoRepository,
            MunicipioRepository municipioRepository) {
        this.departamentoRepository = departamentoRepository;
        this.municipioRepository = municipioRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartamentoDTO> listarDepartamentos() {
        return departamentoRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(d -> new DepartamentoDTO(d.getId(), d.getCodigoDane(), d.getNombre()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MunicipioDTO> listarMunicipiosPorDepartamento(String deptoParam) {
        if (deptoParam == null || deptoParam.isBlank()) return List.of();
        String param = deptoParam.trim();

        // 1. Priorizar búsqueda por código DANE oficial (ej: "17", "05", "11")
        var porCodigo = departamentoRepository.findByCodigoDane(param);
        if (porCodigo.isPresent()) {
            return municipioRepository.findByDepartamentoIdOrderByNombreAsc(porCodigo.get().getId())
                    .stream().map(this::toDto).toList();
        }

        // 2. Si no es código DANE, intentar por ID numérico de base de datos
        try {
            Integer depId = Integer.parseInt(param);
            return municipioRepository.findByDepartamentoIdOrderByNombreAsc(depId)
                    .stream().map(this::toDto).toList();
        } catch (NumberFormatException ignored) {}

        return List.of();
    }

    @Transactional(readOnly = true)
    public List<MunicipioDTO> listarTodosMunicipios() {
        return municipioRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartamentoDTO obtenerDepartamento(String deptoParam) {
        if (deptoParam == null || deptoParam.isBlank()) return null;
        String param = deptoParam.trim();

        var porCodigo = departamentoRepository.findByCodigoDane(param);
        if (porCodigo.isPresent()) {
            Departamento d = porCodigo.get();
            return new DepartamentoDTO(d.getId(), d.getCodigoDane(), d.getNombre());
        }

        try {
            Integer depId = Integer.parseInt(param);
            var d = departamentoRepository.findById(depId);
            if (d.isPresent()) return new DepartamentoDTO(d.get().getId(), d.get().getCodigoDane(), d.get().getNombre());
        } catch (NumberFormatException ignored) {}

        return null;
    }

    @Transactional(readOnly = true)
    public MunicipioDTO obtenerMunicipio(String muniParam) {
        if (muniParam == null || muniParam.isBlank()) return null;
        String param = muniParam.trim();

        var porCodigo = municipioRepository.findByCodigoDane(param);
        if (porCodigo.isPresent()) {
            return toDto(porCodigo.get());
        }

        try {
            Integer munId = Integer.parseInt(param);
            var m = municipioRepository.findById(munId);
            if (m.isPresent()) return toDto(m.get());
        } catch (NumberFormatException ignored) {}

        return null;
    }

    private MunicipioDTO toDto(Municipio m) {
        Integer depId = m.getDepartamento() != null ? m.getDepartamento().getId() : null;
        return new MunicipioDTO(
                m.getId(),
                depId,
                m.getCodigoDane(),
                m.getNombre(),
                m.getLatitud(),
                m.getLongitud()
        );
    }
}
