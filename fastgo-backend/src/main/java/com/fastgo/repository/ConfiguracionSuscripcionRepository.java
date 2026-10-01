package com.fastgo.repository;

import com.fastgo.entity.ConfiguracionSuscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionSuscripcionRepository extends JpaRepository<ConfiguracionSuscripcion, Integer> {

    default Optional<ConfiguracionSuscripcion> findGlobalConfig() {
        return findById(1);
    }
}
