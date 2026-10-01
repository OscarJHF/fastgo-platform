package com.fastgo.dto;

public class UploadResponseDTO {

    private String url;
    private String filename;
    private Long size;
    private String contentType;

    public UploadResponseDTO() {
    }

    public UploadResponseDTO(String url, String filename, Long size, String contentType) {
        this.url = url;
        this.filename = filename;
        this.size = size;
        this.contentType = contentType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
}
