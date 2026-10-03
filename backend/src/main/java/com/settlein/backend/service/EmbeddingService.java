package com.settlein.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@Slf4j
public class EmbeddingService {

    private static final int EMBEDDING_DIMENSION = 16;

    /**
     * Generates a vector embedding for the combined text profile.
     * Uses semantic feature hashing to produce a normalized dense vector of fixed dimension.
     */
    public float[] generateEmbedding(String profileText) {
        if (profileText == null || profileText.trim().isEmpty()) {
            return new float[EMBEDDING_DIMENSION];
        }

        log.info("Generating text embedding for profile text length: {}", profileText.length());

        float[] vector = new float[EMBEDDING_DIMENSION];
        String[] words = profileText.toLowerCase().split("\\s+");

        for (String word : words) {
            byte[] hash = sha256(word);
            for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
                int byteVal = hash[i % hash.length] & 0xFF;
                vector[i] += (byteVal - 128) / 128.0f;
            }
        }

        // L2 Normalize the vector
        float norm = 0.0f;
        for (float v : vector) {
            norm += v * v;
        }
        norm = (float) Math.sqrt(norm);

        if (norm > 0) {
            for (int i = 0; i < vector.length; i++) {
                vector[i] /= norm;
            }
        }

        return vector;
    }

    private byte[] sha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            return text.getBytes(StandardCharsets.UTF_8);
        }
    }
}
