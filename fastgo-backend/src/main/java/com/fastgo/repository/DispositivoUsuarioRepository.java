package com.fastgo.repository;

import com.fastgo.entity.DispositivoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispositivoUsuarioRepository extends JpaRepository<DispositivoUsuario, Long> {

    List<DispositivoUsuario> findByUsuarioIdAndActivoTrue(Integer usuarioId);

    Optional<DispositivoUsuario> findByUsuarioIdAndPushToken(Integer usuarioId, String pushToken);

    Optional<DispositivoUsuario> findByPushToken(String pushToken);

    List<DispositivoUsuario> findByUsuarioId(Integer usuarioId);
}
