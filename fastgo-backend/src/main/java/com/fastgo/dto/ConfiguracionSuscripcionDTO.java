package com.fastgo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ConfiguracionSuscripcionDTO {

    private Integer id;
    private Integer freePrimaryStores;
    private Integer primaryFreePeriodMonths;
    private BigDecimal primaryMonthlyPrice;
    private BigDecimal additionalStoreActivationPrice;
    private BigDecimal additionalStoreMonthlyPrice;
    private Boolean allowNewStores;
    private String bancoNombre;
    private String bancoTipoCuenta;
    private String bancoNumeroCuenta;
    private String bancoTitular;
    private String bancoDocumento;
    private String instruccionesPago;
    private String actualizadoPor;
    private LocalDateTime actualizadoEn;

    public ConfiguracionSuscripcionDTO() {
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

    public String getBancoNombre() { return bancoNombre; }
    public void setBancoNombre(String bancoNombre) { this.bancoNombre = bancoNombre; }

    public String getBancoTipoCuenta() { return bancoTipoCuenta; }
    public void setBancoTipoCuenta(String bancoTipoCuenta) { this.bancoTipoCuenta = bancoTipoCuenta; }

    public String getBancoNumeroCuenta() { return bancoNumeroCuenta; }
    public void setBancoNumeroCuenta(String bancoNumeroCuenta) { this.bancoNumeroCuenta = bancoNumeroCuenta; }

    public String getBancoTitular() { return bancoTitular; }
    public void setBancoTitular(String bancoTitular) { this.bancoTitular = bancoTitular; }

    public String getBancoDocumento() { return bancoDocumento; }
    public void setBancoDocumento(String bancoDocumento) { this.bancoDocumento = bancoDocumento; }

    public String getInstruccionesPago() { return instruccionesPago; }
    public void setInstruccionesPago(String instruccionesPago) { this.instruccionesPago = instruccionesPago; }

    public String getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(String actualizadoPor) { this.actualizadoPor = actualizadoPor; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
