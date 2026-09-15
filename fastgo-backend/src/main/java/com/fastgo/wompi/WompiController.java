package com.fastgo.wompi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fastgo.dto.WompiPaymentRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos/wompi")
public class WompiController {
    private final WompiService service;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public WompiController(WompiService service, com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.service = service;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/acceptance")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Map<String,Object>> acceptance() { return ResponseEntity.ok(service.acceptanceTokens()); }

    @GetMapping("/pse/banks")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<JsonNode> banks() { return ResponseEntity.ok(service.pseBanks()); }

    @PostMapping("/transactions")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Map<String,Object>> create(
            @Valid @RequestBody WompiPaymentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(service.createTransaction(request, authentication.getName()));
    }

    @GetMapping("/transactions/{transactionId}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Map<String,Object>> transaction(
            @PathVariable String transactionId,
            Authentication authentication) {
        return ResponseEntity.ok(service.transactionForCurrentUser(transactionId, authentication.getName()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestHeader(value = "X-Event-Checksum", required = false) String checksum,
            @RequestBody String rawEvent) {
        try {
            JsonNode event = objectMapper.readTree(rawEvent);
            service.processWebhook(event, checksum);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Cuerpo de evento inválido");
        }
        return ResponseEntity.ok().build();
    }
}
