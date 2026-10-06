package com.fastgo.controller;

import com.fastgo.dto.DispositivoRequestDTO;
import com.fastgo.dto.DispositivoResponseDTO;
import com.fastgo.service.DispositivoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispositivos")
public class DispositivoController {

    private final DispositivoService dispositivoService;

    public DispositivoController(DispositivoService dispositivoService) {
        this.dispositivoService = dispositivoService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<DispositivoResponseDTO> registrar(@Valid @RequestBody DispositivoRequestDTO req) {
        DispositivoResponseDTO resp = dispositivoService.registrarDispositivo(req);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/desactivar")
    public ResponseEntity<Map<String, String>> desactivar(@RequestBody Map<String, String> body) {
        String pushToken = body != null ? body.get("pushToken") : null;
        dispositivoService.desactivarDispositivo(pushToken);
        return ResponseEntity.ok(Map.of("mensaje", "Dispositivo desactivado exitosamente"));
    }

    @GetMapping("/mis-dispositivos")
    public ResponseEntity<List<DispositivoResponseDTO>> listarMisDispositivos() {
        return ResponseEntity.ok(dispositivoService.listarMisDispositivos());
    }
}
