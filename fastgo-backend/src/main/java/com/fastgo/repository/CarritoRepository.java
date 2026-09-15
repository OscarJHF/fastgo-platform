package com.fastgo.repository;

import com.fastgo.entity.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    Optional<Carrito> findByUsuarioId(Integer usuarioId);

    Optional<Carrito> findByUsuarioIdAndSucursalId(
            Integer usuarioId,
            Integer sucursalId
    );
}