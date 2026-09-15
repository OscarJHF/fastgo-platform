package com.fastgo.repository;

import com.fastgo.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByPedidoId(Integer pedidoId);

    Optional<Pago> findFirstByPedidoIdOrderByIdDesc(Integer pedidoId);

    List<Pago> findByEstado(String estado);

    Optional<Pago> findByReferencia(String referencia);
}
