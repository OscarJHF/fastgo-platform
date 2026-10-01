package com.fastgo.repository;

import com.fastgo.entity.SeguimientoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeguimientoPedidoRepository extends JpaRepository<SeguimientoPedido, Integer> {
    Optional<SeguimientoPedido> findByPedidoId(Integer pedidoId);
}
