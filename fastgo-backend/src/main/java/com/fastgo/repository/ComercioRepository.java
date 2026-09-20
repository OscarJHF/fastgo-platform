package com.fastgo.repository;

import com.fastgo.entity.Comercio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComercioRepository extends JpaRepository<Comercio, Integer> {

    List<Comercio> findByActivoTrue();

    Optional<Comercio> findByIdAndUsuarioId(
            Integer id,
            Integer usuarioId
    );

    Optional<Comercio> findByUsuarioId(
            Integer usuarioId
    );
}