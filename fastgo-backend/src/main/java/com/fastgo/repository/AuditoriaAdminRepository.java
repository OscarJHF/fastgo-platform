package com.fastgo.repository;

import com.fastgo.entity.AuditoriaAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaAdminRepository extends JpaRepository<AuditoriaAdmin, Integer> {

    List<AuditoriaAdmin> findAllByOrderByFechaDesc();

    List<AuditoriaAdmin> findByEntidadAndEntidadIdOrderByFechaDesc(String entidad, String entidadId);
}
