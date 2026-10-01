package com.fastgo.repository;

import com.fastgo.entity.Comercio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComercioRepository extends JpaRepository<Comercio, Integer> {

    List<Comercio> findByActivoTrue();

    List<Comercio> findByActivoTrueAndEstado(String estado);

    Optional<Comercio> findByIdAndUsuarioId(
            Integer id,
            Integer usuarioId
    );

    Optional<Comercio> findFirstByUsuarioIdOrderByCreadoEnAsc(Integer usuarioId);

    Optional<Comercio> findFirstByUsuarioIdAndEsPrincipalTrue(Integer usuarioId);

    List<Comercio> findAllByUsuarioIdOrderByCreadoEnAsc(Integer usuarioId);

    default Optional<Comercio> findByUsuarioId(Integer usuarioId) {
        return findFirstByUsuarioIdOrderByCreadoEnAsc(usuarioId);
    }
}