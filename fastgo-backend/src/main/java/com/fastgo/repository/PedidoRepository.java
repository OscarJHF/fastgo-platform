package com.fastgo.repository;

import com.fastgo.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    List<Pedido> findByUsuarioId(Integer id);
    List<Pedido> findBySucursalId(Integer id);
    List<Pedido> findByEstado(String estado);
    List<Pedido> findByUsuarioIdAndEstado(Integer id, String estado);
    List<Pedido> findByDomiciliarioId(Integer id);
    List<Pedido> findByEstadoAndDomiciliarioIdIsNull(String estado);

    @Modifying
    @Query("""
            update Pedido p
               set p.domiciliarioId = :domiciliarioId,
                   p.estado = 'EN_CAMINO'
             where p.id = :pedidoId
               and p.estado = 'LISTO'
               and p.domiciliarioId is null
            """)
    int asignarPedidoAtomicamente(
            @Param("pedidoId") Integer pedidoId,
            @Param("domiciliarioId") Integer domiciliarioId);
}
