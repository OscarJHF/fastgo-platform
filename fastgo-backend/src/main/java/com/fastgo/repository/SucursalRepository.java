package com.fastgo.repository;

import com.fastgo.entity.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SucursalRepository extends JpaRepository<Sucursal,Integer> {
    List<Sucursal> findByComercioId(Integer comercioId);
    Optional<Sucursal> findByIdAndComercioId(Integer id,Integer comercioId);
    List<Sucursal> findByAbiertaTrue();
}
