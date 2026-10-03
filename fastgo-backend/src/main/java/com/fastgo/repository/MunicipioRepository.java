package com.fastgo.repository;

import com.fastgo.entity.Municipio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MunicipioRepository extends JpaRepository<Municipio, Integer> {
    List<Municipio> findByDepartamentoIdOrderByNombreAsc(Integer departamentoId);
    List<Municipio> findAllByOrderByNombreAsc();
    Optional<Municipio> findByCodigoDane(String codigoDane);
}
