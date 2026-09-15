package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

public class WompiPaymentRequest {
    @NotNull
    private Integer pedidoId;

    @NotBlank
    @Pattern(regexp = "NEQUI|BANCOLOMBIA_TRANSFER|PSE|DAVIPLATA")
    private String method;

    @NotBlank
    private String acceptanceToken;

    @NotBlank
    private String personalDataAuthToken;

    private String nequiPhone;
    private Integer pseUserType;
    private String pseLegalIdType;
    private String pseLegalId;
    private String pseFinancialInstitutionCode;
    private String bankPaymentDescription;

    public WompiPaymentRequest() {}

    public Integer getPedidoId() { return pedidoId; }
    public void setPedidoId(Integer pedidoId) { this.pedidoId = pedidoId; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getAcceptanceToken() { return acceptanceToken; }
    public void setAcceptanceToken(String acceptanceToken) { this.acceptanceToken = acceptanceToken; }
    public String getPersonalDataAuthToken() { return personalDataAuthToken; }
    public void setPersonalDataAuthToken(String personalDataAuthToken) { this.personalDataAuthToken = personalDataAuthToken; }
    public String getNequiPhone() { return nequiPhone; }
    public void setNequiPhone(String nequiPhone) { this.nequiPhone = nequiPhone; }
    public Integer getPseUserType() { return pseUserType; }
    public void setPseUserType(Integer pseUserType) { this.pseUserType = pseUserType; }
    public String getPseLegalIdType() { return pseLegalIdType; }
    public void setPseLegalIdType(String pseLegalIdType) { this.pseLegalIdType = pseLegalIdType; }
    public String getPseLegalId() { return pseLegalId; }
    public void setPseLegalId(String pseLegalId) { this.pseLegalId = pseLegalId; }
    public String getPseFinancialInstitutionCode() { return pseFinancialInstitutionCode; }
    public void setPseFinancialInstitutionCode(String pseFinancialInstitutionCode) { this.pseFinancialInstitutionCode = pseFinancialInstitutionCode; }
    public String getBankPaymentDescription() { return bankPaymentDescription; }
    public void setBankPaymentDescription(String bankPaymentDescription) { this.bankPaymentDescription = bankPaymentDescription; }
}
