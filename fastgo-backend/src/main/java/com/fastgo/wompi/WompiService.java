package com.fastgo.wompi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fastgo.dto.WompiPaymentRequest;
import com.fastgo.entity.Pago;
import com.fastgo.entity.Pedido;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.PagoRepository;
import com.fastgo.repository.PedidoRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class WompiService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final String publicKey;
    private final String privateKey;
    private final String integritySecret;
    private final String eventsSecret;
    private final String redirectUrl;
    private final boolean enabled;

    public WompiService(
            ObjectMapper objectMapper,
            PedidoRepository pedidoRepository,
            PagoRepository pagoRepository,
            UsuarioRepository usuarioRepository,
            @Value("${fastgo.wompi.base-url:https://sandbox.wompi.co/v1}") String baseUrl,
            @Value("${fastgo.wompi.public-key:}") String publicKey,
            @Value("${fastgo.wompi.private-key:}") String privateKey,
            @Value("${fastgo.wompi.integrity-secret:}") String integritySecret,
            @Value("${fastgo.wompi.events-secret:}") String eventsSecret,
            @Value("${fastgo.wompi.redirect-url:http://localhost:8081/payment-result}") String redirectUrl,
            @Value("${fastgo.wompi.enabled:false}") boolean enabled) {
        this.objectMapper = objectMapper;
        this.pedidoRepository = pedidoRepository;
        this.pagoRepository = pagoRepository;
        this.usuarioRepository = usuarioRepository;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.integritySecret = integritySecret;
        this.eventsSecret = eventsSecret;
        this.redirectUrl = redirectUrl;
        this.enabled = enabled;
    }

    public Map<String, Object> acceptanceTokens() {
        requireEnabled();
        JsonNode response = restClient.get()
                .uri("/merchants/{publicKey}", publicKey)
                .retrieve()
                .body(JsonNode.class);
        JsonNode data = response == null ? null : response.path("data");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("acceptanceToken", data.path("presigned_acceptance").path("acceptance_token").asText());
        result.put("acceptancePermalink", data.path("presigned_acceptance").path("permalink").asText());
        result.put("personalDataAuthToken", data.path("presigned_personal_data_auth").path("acceptance_token").asText());
        result.put("personalDataAuthPermalink", data.path("presigned_personal_data_auth").path("permalink").asText());
        return result;
    }

    public JsonNode pseBanks() {
        requireEnabled();
        return restClient.get().uri("/pse/financial_institutions")
                .retrieve().body(JsonNode.class);
    }

    public Map<String, Object> createTransaction(WompiPaymentRequest request, String userEmail) {
        requireEnabled();
        Pedido pedido = pedidoRepository.findById(request.getPedidoId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        Usuario usuario = usuarioRepository.findByCorreo(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));

        if (!pedido.getUsuarioId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes permiso para pagar este pedido");
        }
        if (!"PENDIENTE".equalsIgnoreCase(pedido.getEstado())) {
            throw new IllegalArgumentException("El pedido no está disponible para pago");
        }
        var existingPayment = pagoRepository.findFirstByPedidoIdOrderByIdDesc(pedido.getId());
        if (existingPayment.isPresent() && !"RECHAZADO".equalsIgnoreCase(existingPayment.get().getEstado())) {
            throw new IllegalArgumentException("El pedido ya tiene un pago en proceso o confirmado");
        }

        String method = request.getMethod().trim().toUpperCase();
        String reference = "FASTGO-" + pedido.getId() + "-" + UUID.randomUUID().toString().replace("-", "");
        long amountInCents = pedido.getTotal().multiply(BigDecimal.valueOf(100)).longValueExact();
        String signature = sha256(reference + amountInCents + "COP" + integritySecret);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount_in_cents", amountInCents);
        body.put("currency", "COP");
        body.put("customer_email", usuario.getCorreo());
        body.put("reference", reference);
        body.put("signature", signature);
        body.put("acceptance_token", request.getAcceptanceToken());
        body.put("accept_personal_auth", request.getPersonalDataAuthToken());
        body.put("redirect_url", redirectUrl);
        body.put("payment_method", paymentMethod(request, method));

        JsonNode response = restClient.post()
                .uri("/transactions")
                .header("Authorization", "Bearer " + privateKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        JsonNode data = response == null ? null : response.path("data");
        String wompiId = data.path("id").asText();
        String status = data.path("status").asText("PENDING");

        Pago pago = existingPayment.orElseGet(Pago::new);
        pago.setPedidoId(pedido.getId());
        pago.setMetodo(method);
        pago.setEstado(mapStatus(status));
        pago.setReferencia(reference);
        pagoRepository.save(pago);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transactionId", wompiId);
        result.put("reference", reference);
        result.put("status", status);
        result.put("paymentMethodType", data.path("payment_method_type").asText(method));
        result.put("redirectUrl", data.path("payment_method").path("extra").path("async_payment_url").asText(null));
        result.put("amountInCents", amountInCents);
        return result;
    }

    public Map<String, Object> transactionForCurrentUser(String transactionId, String userEmail) {
        requireEnabled();
        JsonNode response = restClient.get().uri("/transactions/{id}", transactionId)
                .retrieve().body(JsonNode.class);
        JsonNode data = response == null ? null : response.path("data");
        String reference = data.path("reference").asText();
        Pago pago = pagoRepository.findByReferencia(reference)
                .orElseThrow(() -> new IllegalArgumentException("Transacción no vinculada a FastGo"));
        Pedido pedido = pedidoRepository.findById(pago.getPedidoId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        Usuario usuario = usuarioRepository.findByCorreo(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
        if (!pedido.getUsuarioId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes permiso para consultar esta transacción");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transactionId", data.path("id").asText());
        result.put("reference", reference);
        result.put("status", data.path("status").asText());
        result.put("amountInCents", data.path("amount_in_cents").asLong());
        return result;
    }

    public void processWebhook(JsonNode event, String headerChecksum) {
        requireEventSecret();
        String expected = calculateEventChecksum(event);
        String provided = headerChecksum;
        if (provided == null || provided.isBlank()) {
            provided = event.path("signature").path("checksum").asText();
        }
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), provided.toLowerCase().getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Firma de evento inválida");
        }
        if (!"transaction.updated".equals(event.path("event").asText())) return;
        JsonNode transaction = event.path("data").path("transaction");
        String reference = transaction.path("reference").asText();
        pagoRepository.findByReferencia(reference).ifPresent(pago -> {
            String status = mapStatus(transaction.path("status").asText());
            if (!"CONFIRMADO".equalsIgnoreCase(pago.getEstado())) {
                pago.setEstado(status);
                pagoRepository.save(pago);

                if ("CONFIRMADO".equalsIgnoreCase(status)) {
                    pedidoRepository.findById(pago.getPedidoId()).ifPresent(pedido -> {
                        if ("PENDIENTE".equalsIgnoreCase(pedido.getEstado())) {
                            pedido.setEstado("CONFIRMADO");
                            pedidoRepository.save(pedido);
                        }
                    });
                }
            }
        });
    }

    private Map<String, Object> paymentMethod(WompiPaymentRequest request, String method) {
        Map<String, Object> paymentMethod = new LinkedHashMap<>();
        paymentMethod.put("type", method);
        switch (method) {
            case "NEQUI" -> {
                if (request.getNequiPhone() == null || !request.getNequiPhone().matches("^3\\d{9}$"))
                    throw new IllegalArgumentException("El celular Nequi no es válido");
                paymentMethod.put("phone_number", request.getNequiPhone());
            }
            case "PSE" -> {
                if (request.getPseUserType() == null || (request.getPseUserType() != 0 && request.getPseUserType() != 1))
                    throw new IllegalArgumentException("El tipo de persona PSE no es válido");
                requireText(request.getPseLegalIdType(), "El tipo de documento PSE es obligatorio");
                requireText(request.getPseLegalId(), "El documento PSE es obligatorio");
                requireText(request.getPseFinancialInstitutionCode(), "El banco PSE es obligatorio");
                paymentMethod.put("user_type", request.getPseUserType());
                paymentMethod.put("user_legal_id_type", request.getPseLegalIdType().toUpperCase());
                paymentMethod.put("user_legal_id", request.getPseLegalId());
                paymentMethod.put("financial_institution_code", request.getPseFinancialInstitutionCode());
                paymentMethod.put("payment_description", trimDescription(request.getBankPaymentDescription()));
            }
            case "BANCOLOMBIA_TRANSFER" -> paymentMethod.put("payment_description", trimDescription(request.getBankPaymentDescription()));
            case "DAVIPLATA" -> { }
            default -> throw new IllegalArgumentException("Método de pago no soportado");
        }
        return paymentMethod;
    }

    private String trimDescription(String value) {
        if (value == null || value.isBlank()) return "Pago FastGo";
        return value.replace("'", "").trim().substring(0, Math.min(64, value.replace("'", "").trim().length()));
    }

    private String mapStatus(String wompiStatus) {
        return switch (wompiStatus == null ? "" : wompiStatus.toUpperCase()) {
            case "APPROVED" -> "CONFIRMADO";
            case "DECLINED", "ERROR", "VOIDED" -> "RECHAZADO";
            default -> "PENDIENTE";
        };
    }

    private String calculateEventChecksum(JsonNode event) {
        StringBuilder value = new StringBuilder();
        for (JsonNode property : event.path("signature").path("properties")) {
            value.append(resolve(event.path("data"), property.asText()));
        }
        value.append(event.path("timestamp").asText());
        value.append(eventsSecret);
        return sha256(value.toString());
    }

    private String resolve(JsonNode root, String path) {
        JsonNode current = root;
        for (String part : path.split("\\.")) current = current.path(part);
        return current.isValueNode() ? current.asText() : current.toString();
    }

    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }

    private void requireEnabled() {
        if (!enabled || publicKey.isBlank() || privateKey.isBlank() || integritySecret.isBlank())
            throw new IllegalStateException("La integración Wompi no está configurada");
    }

    private void requireEventSecret() {
        if (eventsSecret.isBlank()) throw new IllegalStateException("FASTGO_WOMPI_EVENTS_SECRET no está configurado");
    }

    private void requireText(String value, String message) { if (value == null || value.isBlank()) throw new IllegalArgumentException(message); }
}
