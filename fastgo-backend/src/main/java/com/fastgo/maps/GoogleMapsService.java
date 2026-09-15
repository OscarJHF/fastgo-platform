package com.fastgo.maps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fastgo.dto.MapGeocodeRequest;
import com.fastgo.dto.MapRouteRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GoogleMapsService {
    private final RestClient client;
    private final String apiKey;
    private final boolean enabled;

    public GoogleMapsService(
            @Value("${fastgo.maps.base-url:https://maps.googleapis.com}") String baseUrl,
            @Value("${fastgo.maps.server-key:}") String apiKey,
            @Value("${fastgo.maps.enabled:false}") boolean enabled) {
        this.client = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.enabled = enabled;
    }

    public Map<String,Object> geocode(MapGeocodeRequest request) {
        requireEnabled();
        JsonNode response = client.get().uri(uri -> uri.path("/maps/api/geocode/json")
                .queryParam("address", request.getAddress().trim())
                .queryParam("key", apiKey).build()).retrieve().body(JsonNode.class);
        return Map.of("status", response.path("status").asText(), "results", response.path("results"));
    }

    public Map<String,Object> route(MapRouteRequest request) {
        requireEnabled();
        Map<String,Object> origin = Map.of("location", Map.of("latLng", Map.of("latitude", request.getOriginLat(), "longitude", request.getOriginLng())));
        Map<String,Object> destination = Map.of("location", Map.of("latLng", Map.of("latitude", request.getDestinationLat(), "longitude", request.getDestinationLng())));
        Map<String,Object> body = new LinkedHashMap<>();
        body.put("origin", origin);
        body.put("destination", destination);
        body.put("travelMode", "TWO_WHEELER");
        body.put("routingPreference", "TRAFFIC_AWARE");
        JsonNode response = client.post().uri("/directions/v2:computeRoutes")
                .header("X-Goog-Api-Key", apiKey)
                .header("X-Goog-FieldMask", "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline")
                .contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JsonNode.class);
        return Map.of("routes", response.path("routes"));
    }

    public Map<String,Object> clientConfig() {
        return Map.of("mapsEnabled", enabled && !apiKey.isBlank(), "provider", "GOOGLE_MAPS");
    }

    private void requireEnabled() {
        if (!enabled || apiKey.isBlank()) throw new IllegalStateException("Google Maps no está configurado");
    }
}
