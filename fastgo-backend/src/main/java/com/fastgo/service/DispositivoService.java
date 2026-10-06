package com.fastgo.service;

import com.fastgo.dto.DispositivoRequestDTO;
import com.fastgo.dto.DispositivoResponseDTO;
import com.fastgo.entity.DispositivoUsuario;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.DispositivoUsuarioRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DispositivoService {

    private final DispositivoUsuarioRepository dispositivoUsuarioRepository;
    private final UsuarioRepository usuarioRepository;

    public DispositivoService(DispositivoUsuarioRepository dispositivoUsuarioRepository,
                              UsuarioRepository usuarioRepository) {
        this.dispositivoUsuarioRepository = dispositivoUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario usuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }
        return usuarioRepository.findByCorreo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }

    @Transactional
    public DispositivoResponseDTO registrarDispositivo(DispositivoRequestDTO req) {
        Usuario usuario = usuarioAutenticado();

        Optional<DispositivoUsuario> opt = dispositivoUsuarioRepository
                .findByUsuarioIdAndPushToken(usuario.getId(), req.getPushToken());

        DispositivoUsuario disp;
        if (opt.isPresent()) {
            disp = opt.get();
            disp.setDispositivoId(req.getDispositivoId());
            disp.setPlataforma(req.getPlataforma());
            disp.setActivo(true);
            disp.setActualizadoEn(LocalDateTime.now());
        } else {
            disp = new DispositivoUsuario();
            disp.setUsuario(usuario);
            disp.setDispositivoId(req.getDispositivoId());
            disp.setPlataforma(req.getPlataforma());
            disp.setPushToken(req.getPushToken());
            disp.setActivo(true);
            disp.setCreadoEn(LocalDateTime.now());
            disp.setActualizadoEn(LocalDateTime.now());
        }

        disp = dispositivoUsuarioRepository.save(disp);
        return mapToDTO(disp);
    }

    @Transactional
    public void desactivarDispositivo(String pushToken) {
        if (pushToken == null || pushToken.isBlank()) {
            return;
        }
        Usuario usuario = usuarioAutenticado();
        dispositivoUsuarioRepository.findByUsuarioIdAndPushToken(usuario.getId(), pushToken.trim())
                .ifPresent(d -> {
                    d.setActivo(false);
                    d.setActualizadoEn(LocalDateTime.now());
                    dispositivoUsuarioRepository.save(d);
                });
    }

    @Transactional(readOnly = true)
    public List<DispositivoResponseDTO> listarMisDispositivos() {
        Usuario usuario = usuarioAutenticado();
        return dispositivoUsuarioRepository.findByUsuarioIdAndActivoTrue(usuario.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private DispositivoResponseDTO mapToDTO(DispositivoUsuario d) {
        return new DispositivoResponseDTO(
                d.getId(),
                d.getUsuario().getId(),
                d.getDispositivoId(),
                d.getPlataforma(),
                d.getPushToken(),
                d.getActivo(),
                d.getActualizadoEn()
        );
    }
}
