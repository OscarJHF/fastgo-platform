package com.fastgo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_suscripciones")
public class ConfiguracionSuscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "free_primary_stores", nullable = false)
    private Integer freePrimaryStores;

    @Column(name = "primary_free_period_months", nullable = false)
    private Integer primaryFreePeriodMonths;

    @Column(name = "primary_monthly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal primaryMonthlyPrice;

    @Column(name = "additional_store_activation_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal additionalStoreActivationPrice;

    @Column(name = "additional_store_monthly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal additionalStoreMonthlyPrice;

    @Column(name = "allow_new_stores", nullable = false)
    private Boolean allowNewStores;

    @Column(name = "actualizado_por", length = 100)
    private String actualizadoPor;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public ConfiguracionSuscripcion() {
    }

    @PrePersist
    @PreUpdate
    protected void alActualizar() {
        actualizadoEn = LocalDateTime.now();
        if (freePrimaryStores == null) freePrimaryStores = 1;
        if (primaryFreePeriodMonths == null) primaryFreePeriodMonths = 6;
        if (primaryMonthlyPrice == null) primaryMonthlyPrice = new BigDecimal("20000.00");
        if (additionalStoreActivationPrice == null) additionalStoreActivationPrice = new BigDecimal("50000.00");
        if (additionalStoreMonthlyPrice == null) additionalStoreMonthlyPrice = new BigDecimal("30000.00");
        if (allowNewStores == null) allowNewStores = true;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getFreePrimaryStores() { return freePrimaryStores; }
    public void setFreePrimaryStores(Integer freePrimaryStores) { this.freePrimaryStores = freePrimaryStores; }

    public Integer getPrimaryFreePeriodMonths() { return primaryFreePeriodMonths; }
    public void setPrimaryFreePeriodMonths(Integer primaryFreePeriodMonths) { this.primaryFreePeriodMonths = primaryFreePeriodMonths; }

    public BigDecimal getPrimaryMonthlyPrice() { return primaryMonthlyPrice; }
    public void setPrimaryMonthlyPrice(BigDecimal primaryMonthlyPrice) { this.primaryMonthlyPrice = primaryMonthlyPrice; }

    public BigDecimal getAdditionalStoreActivationPrice() { return additionalStoreActivationPrice; }
    public void setAdditionalStoreActivationPrice(BigDecimal additionalStoreActivationPrice) { this.additionalStoreActivationPrice = additionalStoreActivationPrice; }

    public BigDecimal getAdditionalStoreMonthlyPrice() { return additionalStoreMonthlyPrice; }
    public void setAdditionalStoreMonthlyPrice(BigDecimal additionalStoreMonthlyPrice) { this.additionalStoreMonthlyPrice = additionalStoreMonthlyPrice; }

    public Boolean getAllowNewStores() { return allowNewStores; }
    public void setAllowNewStores(Boolean allowNewStores) { this.allowNewStores = allowNewStores; }

    public String getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(String actualizadoPor) { this.actualizadoPor = actualizadoPor; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
