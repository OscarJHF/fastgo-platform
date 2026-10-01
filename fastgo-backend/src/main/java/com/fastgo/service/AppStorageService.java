package com.fastgo.service;

import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Primary
@Service
public class AppStorageService implements StorageService {

    private final R2StorageService r2StorageService;
    private final LocalStorageService localStorageService;

    public AppStorageService(R2StorageService r2StorageService, LocalStorageService localStorageService) {
        this.r2StorageService = r2StorageService;
        this.localStorageService = localStorageService;
    }

    private StorageService activeService() {
        if (r2StorageService.isR2Configured()) {
            return r2StorageService;
        }
        return localStorageService;
    }

    @Override
    public String storePublic(MultipartFile file, String filename) throws IOException {
        return activeService().storePublic(file, filename);
    }

    @Override
    public Resource loadPublic(String filename) {
        return activeService().loadPublic(filename);
    }

    @Override
    public MediaType getPublicMediaType(String filename) {
        return activeService().getPublicMediaType(filename);
    }

    @Override
    public String storePrivateProof(MultipartFile file, String filename) throws IOException {
        return activeService().storePrivateProof(file, filename);
    }

    @Override
    public Resource loadPrivateProof(Integer pedidoId, String fallbackFilename) {
        return activeService().loadPrivateProof(pedidoId, fallbackFilename);
    }

    @Override
    public MediaType getPrivateProofMediaType(String filename) {
        return activeService().getPrivateProofMediaType(filename);
    }

    @Override
    public boolean existsPrivateProof(Integer pedidoId, String fallbackFilename) {
        return activeService().existsPrivateProof(pedidoId, fallbackFilename);
    }

    @Override
    public void deletePrivateProof(Integer pedidoId, String fallbackFilename) {
        activeService().deletePrivateProof(pedidoId, fallbackFilename);
    }
}
