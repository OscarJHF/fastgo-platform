package com.fastgo.repository;

import com.fastgo.entity.OfertaEncomienda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfertaEncomiendaRepository extends JpaRepository<OfertaEncomienda, Integer> {

    List<OfertaEncomienda> findByEncomiendaIdOrderByCreadoEnDesc(Integer encomiendaId);

    List<OfertaEncomienda> findByDomiciliarioIdOrderByCreadoEnDesc(Integer domiciliarioId);

    List<OfertaEncomienda> findByEncomiendaIdAndEstado(Integer encomiendaId, String estado);

    Optional<OfertaEncomienda> findByEncomiendaIdAndDomiciliarioIdAndEstado(Integer encomiendaId, Integer domiciliarioId, String estado);

    long countByEncomiendaIdAndEstado(Integer encomiendaId, String estado);

    @Modifying
    @Query("UPDATE OfertaEncomienda o SET o.estado = 'CANCELADA', o.actualizadoEn = CURRENT_TIMESTAMP WHERE o.encomienda.id = :encomiendaId AND o.id <> :ofertaGanadoraId AND o.estado = 'PENDIENTE'")
    int cancelarOtrasOfertasPendientes(@Param("encomiendaId") Integer encomiendaId, @Param("ofertaGanadoraId") Integer ofertaGanadoraId);

    @Modifying
    @Query("UPDATE OfertaEncomienda o SET o.estado = 'CANCELADA', o.actualizadoEn = CURRENT_TIMESTAMP WHERE o.encomienda.id = :encomiendaId AND o.estado = 'PENDIENTE'")
    int cancelarTodasLasOfertasPendientes(@Param("encomiendaId") Integer encomiendaId);
}
