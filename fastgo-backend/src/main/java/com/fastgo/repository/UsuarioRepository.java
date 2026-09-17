package com.fastgo.repository;

import com.fastgo.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findFirstByCorreo(String correo);

    List<Usuario> findAllByCorreo(String correo);

    Optional<Usuario> findByCorreoAndRolId(String correo, Integer rolId);

    boolean existsByCorreoAndRolId(String correo, Integer rolId);

    boolean existsByCorreo(String correo);

    boolean existsByTelefono(String telefono);
}