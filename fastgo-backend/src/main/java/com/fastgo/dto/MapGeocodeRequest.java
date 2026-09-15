package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MapGeocodeRequest {
    @NotBlank
    @Size(max = 255)
    private String address;

    public MapGeocodeRequest() {}
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
