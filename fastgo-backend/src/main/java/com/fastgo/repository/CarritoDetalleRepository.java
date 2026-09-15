package com.fastgo.repository;

import com.fastgo.entity.CarritoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarritoDetalleRepository
        extends JpaRepository<CarritoDetalle, Integer> {

    List<CarritoDetalle> findByCarritoId(Integer carritoId);

    Optional<CarritoDetalle> findByCarritoIdAndProductoId(
            Integer carritoId,
            Integer productoId
    );

    void deleteByCarritoId(Integer carritoId);
}