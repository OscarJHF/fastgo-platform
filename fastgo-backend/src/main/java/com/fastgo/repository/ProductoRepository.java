package com.fastgo.repository;

import com.fastgo.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    List<Producto> findBySucursalId(Integer sucursalId);

    List<Producto> findByCategoriaId(Integer categoriaId);

    List<Producto> findByDisponibleTrue();

    List<Producto> findByDestacadoTrue();

    List<Producto> findBySucursalIdAndDisponibleTrue(Integer sucursalId);
}