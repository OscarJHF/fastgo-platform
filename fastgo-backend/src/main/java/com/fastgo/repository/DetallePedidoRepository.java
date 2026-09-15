package com.fastgo.repository;

import com.fastgo.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetallePedidoRepository
        extends JpaRepository<DetallePedido, Integer> {

    List<DetallePedido> findByPedidoId(Integer pedidoId);

    List<DetallePedido> findByProductoId(Integer productoId);

    void deleteByPedidoId(Integer pedidoId);
}