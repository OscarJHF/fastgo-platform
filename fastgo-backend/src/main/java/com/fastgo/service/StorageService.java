package com.fastgo.service;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {
    String storePublic(MultipartFile file, String filename) throws IOException;
    Resource loadPublic(String filename);
    MediaType getPublicMediaType(String filename);

    String storePrivateProof(MultipartFile file, String filename) throws IOException;
    Resource loadPrivateProof(Integer pedidoId, String fallbackFilename);
    MediaType getPrivateProofMediaType(String filename);
    boolean existsPrivateProof(Integer pedidoId, String fallbackFilename);
    void deletePrivateProof(Integer pedidoId, String fallbackFilename);
}
