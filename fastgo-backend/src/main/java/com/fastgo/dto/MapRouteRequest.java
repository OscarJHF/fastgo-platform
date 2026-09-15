package com.fastgo.dto;

import jakarta.validation.constraints.NotNull;

public class MapRouteRequest {
    @NotNull private Double originLat;
    @NotNull private Double originLng;
    @NotNull private Double destinationLat;
    @NotNull private Double destinationLng;

    public MapRouteRequest() {}
    public Double getOriginLat() { return originLat; }
    public void setOriginLat(Double originLat) { this.originLat = originLat; }
    public Double getOriginLng() { return originLng; }
    public void setOriginLng(Double originLng) { this.originLng = originLng; }
    public Double getDestinationLat() { return destinationLat; }
    public void setDestinationLat(Double destinationLat) { this.destinationLat = destinationLat; }
    public Double getDestinationLng() { return destinationLng; }
    public void setDestinationLng(Double destinationLng) { this.destinationLng = destinationLng; }
}
