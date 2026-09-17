package com.fastgo.service;

import com.fastgo.dto.CalcularTarifaRequest;
import com.fastgo.dto.TarifaResponseDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TarifaService {

    public static final BigDecimal TARIFA_BASE = BigDecimal.valueOf(2000);
    public static final BigDecimal PRECIO_POR_KM = BigDecimal.valueOf(200);
    private static final double RADIO_TIERRA_KM = 6371.0088;

    public TarifaResponseDTO calcular(CalcularTarifaRequest request) {
        BigDecimal distancia = BigDecimal.ONE;

        if (request != null && request.getDistanciaKm() != null && request.getDistanciaKm().compareTo(BigDecimal.ZERO) > 0) {
            distancia = request.getDistanciaKm();
        } else if (request != null
                && request.getOrigenLat() != null && request.getOrigenLng() != null
                && request.getDestinoLat() != null && request.getDestinoLng() != null) {
            distancia = calcularDistanciaHaversine(
                    request.getOrigenLat(), request.getOrigenLng(),
                    request.getDestinoLat(), request.getDestinoLng());
        }

        BigDecimal costo = calcularTarifaPorDistancia(distancia);
        String desglose = generarDesglose(distancia, costo);

        return new TarifaResponseDTO(distancia, costo, TARIFA_BASE, desglose);
    }

    public BigDecimal calcularTarifaPorDistancia(BigDecimal distanciaKm) {
        if (distanciaKm == null || distanciaKm.compareTo(BigDecimal.ZERO) <= 0) {
            return TARIFA_BASE;
        }

        // Si la distancia es menor o igual a 1 km, aplica únicamente la tarifa base mínima ($2.000 COP)
        if (distanciaKm.compareTo(BigDecimal.ONE) <= 0) {
            return TARIFA_BASE;
        }

        // Para distancias mayores a 1 km: Base $2.000 + ceil(distancia) * $200 COP
        long kmCeil = (long) Math.ceil(distanciaKm.doubleValue());
        BigDecimal incremento = BigDecimal.valueOf(kmCeil).multiply(PRECIO_POR_KM);
        return TARIFA_BASE.add(incremento);
    }

    public BigDecimal calcularDistanciaHaversine(
            BigDecimal lat1, BigDecimal lon1,
            BigDecimal lat2, BigDecimal lon2) {

        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return BigDecimal.ONE;
        }

        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double rLat1 = Math.toRadians(lat1.doubleValue());
        double rLat2 = Math.toRadians(lat2.doubleValue());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(rLat1) * Math.cos(rLat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distancia = RADIO_TIERRA_KM * c;

        if (distancia <= 0.05) {
            return BigDecimal.valueOf(0.5);
        }

        return BigDecimal.valueOf(distancia).setScale(2, RoundingMode.HALF_UP);
    }

    private String generarDesglose(BigDecimal distancia, BigDecimal costo) {
        if (distancia.compareTo(BigDecimal.ONE) <= 0) {
            return "Tarifa base mínima ($2.000 COP) para distancias hasta 1 km";
        }
        long kmCeil = (long) Math.ceil(distancia.doubleValue());
        return String.format("Base $2.000 + %d km (redondeado hacia arriba) x $200 COP = $%s COP",
                kmCeil, costo.toPlainString());
    }
}
