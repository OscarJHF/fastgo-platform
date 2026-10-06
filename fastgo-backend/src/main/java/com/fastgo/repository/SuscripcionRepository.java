package com.fastgo.repository;

import com.fastgo.entity.Suscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuscripcionRepository extends JpaRepository<Suscripcion, Integer> {

    List<Suscripcion> findByComercioId(Integer comercioId);

    Optional<Suscripcion> findFirstByComercioIdOrderByCreadoEnDesc(Integer comercioId);

    List<Suscripcion> findByUsuarioIdOrderByCreadoEnDesc(Integer usuarioId);

    Optional<Suscripcion> findFirstByComercioIdAndEstado(Integer comercioId, String estado);

    List<Suscripcion> findByEstadoOrderByCreadoEnDesc(String estado);

    List<Suscripcion> findByEstadoIn(List<String> estados);
}
