package com.fastgo.repository;

import com.fastgo.entity.Encomienda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncomiendaRepository extends JpaRepository<Encomienda, Integer> {

    List<Encomienda> findByClienteIdOrderByCreadoEnDesc(Integer clienteId);

    List<Encomienda> findByEstadoOrderByCreadoEnDesc(String estado);

    List<Encomienda> findByDomiciliarioIdOrderByCreadoEnDesc(Integer domiciliarioId);
}
