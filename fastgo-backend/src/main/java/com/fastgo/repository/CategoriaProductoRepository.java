package com.fastgo.repository;

import com.fastgo.entity.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaProductoRepository
        extends JpaRepository<CategoriaProducto, Integer> {

    List<CategoriaProducto> findByActivoTrue();
}