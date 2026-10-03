package com.fastgo.repository;

import com.fastgo.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Integer> {
    List<Departamento> findAllByOrderByNombreAsc();
    Optional<Departamento> findByCodigoDane(String codigoDane);
}
