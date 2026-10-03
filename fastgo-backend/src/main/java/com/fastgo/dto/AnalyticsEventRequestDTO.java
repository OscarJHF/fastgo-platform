package com.fastgo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnalyticsEventRequestDTO {

    @NotBlank(message = "El tipo de evento es obligatorio")
    @Size(max = 50, message = "El tipo de evento no puede exceder 50 caracteres")
    private String eventType;

    @Size(max = 100)
    private String anonymousId;

    @Size(max = 100)
    private String sessionId;

    @Size(max = 20)
    private String platform;

    @Size(max = 20)
    private String appVersion;

    @Size(max = 255)
    private String pathOrScreen;

    @Size(max = 255)
    private String referrer;

    @Size(max = 100)
    private String utmSource;

    @Size(max = 100)
    private String utmMedium;

    @Size(max = 100)
    private String utmCampaign;

    private String metadata;

    public AnalyticsEventRequestDTO() {
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getAnonymousId() {
        return anonymousId;
    }

    public void setAnonymousId(String anonymousId) {
        this.anonymousId = anonymousId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getPlatform() {
        return platform != null && !platform.isBlank() ? platform.trim().toUpperCase() : "WEB";
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getAppVersion() {
        return appVersion;
    }

    public void setAppVersion(String appVersion) {
        this.appVersion = appVersion;
    }

    public String getPathOrScreen() {
        return pathOrScreen;
    }

    public void setPathOrScreen(String pathOrScreen) {
        this.pathOrScreen = pathOrScreen;
    }

    public String getReferrer() {
        return referrer;
    }

    public void setReferrer(String referrer) {
        this.referrer = referrer;
    }

    public String getUtmSource() {
        return utmSource;
    }

    public void setUtmSource(String utmSource) {
        this.utmSource = utmSource;
    }

    public String getUtmMedium() {
        return utmMedium;
    }

    public void setUtmMedium(String utmMedium) {
        this.utmMedium = utmMedium;
    }

    public String getUtmCampaign() {
        return utmCampaign;
    }

    public void setUtmCampaign(String utmCampaign) {
        this.utmCampaign = utmCampaign;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
