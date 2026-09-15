package com.fastgo.repository;

import com.fastgo.entity.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DireccionRepository extends JpaRepository<Direccion, Integer> {

    List<Direccion> findByUsuarioId(Integer usuarioId);

    Optional<Direccion> findByIdAndUsuarioId(
            Integer id,
            Integer usuarioId
    );

    List<Direccion> findByUsuarioIdAndPrincipalTrue(
            Integer usuarioId
    );
}