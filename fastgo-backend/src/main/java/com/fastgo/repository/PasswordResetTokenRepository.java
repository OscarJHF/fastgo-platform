package com.fastgo.repository;

import com.fastgo.entity.PasswordResetToken;
import com.fastgo.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenAndUtilizadoFalse(String token);

    List<PasswordResetToken> findByUsuarioAndUtilizadoFalse(Usuario usuario);
}
