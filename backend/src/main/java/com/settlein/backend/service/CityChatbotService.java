package com.settlein.backend.service;

import com.settlein.backend.dto.CityChatRequest;
import com.settlein.backend.dto.CityChatResponse;
import com.settlein.backend.entity.CityKnowledgeChunk;
import com.settlein.backend.repository.CityKnowledgeChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CityChatbotService {

    private final CityKnowledgeChunkRepository knowledgeRepository;
    private final EmbeddingService embeddingService;

    public CityChatResponse askCityQuestion(CityChatRequest request) {
        String userMsg = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userMsg.isEmpty()) {
            return CityChatResponse.builder()
                    .answer("Hello! I'm your SettleIn Local Guide. Ask me anything about transport, safety tips, or PG hubs in Noida, Delhi, or Bengaluru!")
                    .city("General")
                    .sources(Collections.emptyList())
                    .confidenceScore(100.0)
                    .build();
        }

        // 1. Target City Resolution
        String targetCity = resolveTargetCity(request.getCity(), userMsg);
        log.info("Processing RAG question for target city '{}': {}", targetCity, userMsg);

        // 2. Query Vector Embedding
        float[] queryEmbedding = embeddingService.generateEmbedding(userMsg + " " + targetCity);

        // 3. Vector Retrieval & Similarity Calculation
        List<CityKnowledgeChunk> allChunks;
        if ("ALL".equalsIgnoreCase(targetCity) || targetCity.isEmpty()) {
            allChunks = knowledgeRepository.findAll();
        } else {
            allChunks = knowledgeRepository.findByCityIgnoreCase(targetCity);
            if (allChunks.isEmpty()) {
                allChunks = knowledgeRepository.findAll();
            }
        }

        List<ScoredChunk> scoredChunks = new ArrayList<>();
        for (CityKnowledgeChunk chunk : allChunks) {
            double similarity = calculateCosineSimilarity(queryEmbedding, chunk.getEmbedding());
            scoredChunks.add(new ScoredChunk(chunk, similarity));
        }

        // Sort by highest vector similarity
        scoredChunks.sort(Comparator.comparingDouble(ScoredChunk::getSimilarity).reversed());
        List<ScoredChunk> topChunks = scoredChunks.stream().limit(3).collect(Collectors.toList());

        // 4. Synthesize Grounded RAG Answer
        String answer = generateGroundedAnswer(userMsg, targetCity, topChunks);
        List<String> sourceTitles = topChunks.stream()
                .map(c -> c.getChunk().getCity() + ": " + c.getChunk().getTitle())
                .collect(Collectors.toList());

        double avgConfidence = topChunks.isEmpty() ? 70.0 :
                Math.min(98.0, Math.max(75.0, Math.round(topChunks.get(0).getSimilarity() * 100.0 * 10.0) / 10.0));

        return CityChatResponse.builder()
                .answer(answer)
                .city(targetCity.toUpperCase())
                .sources(sourceTitles)
                .confidenceScore(avgConfidence)
                .build();
    }

    private String resolveTargetCity(String requestedCity, String message) {
        if (requestedCity != null && !requestedCity.trim().isEmpty() && !"ALL".equalsIgnoreCase(requestedCity)) {
            return requestedCity.trim();
        }

        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains("noida") || lowerMsg.contains("sector 62") || lowerMsg.contains("aqua line") || lowerMsg.contains("sector 18")) {
            return "Noida";
        } else if (lowerMsg.contains("delhi") || lowerMsg.contains("south delhi") || lowerMsg.contains("gtb nagar") || lowerMsg.contains("saket") || lowerMsg.contains("dmrc")) {
            return "Delhi";
        } else if (lowerMsg.contains("bengaluru") || lowerMsg.contains("bangalore") || lowerMsg.contains("koramangala") || lowerMsg.contains("hsr") || lowerMsg.contains("indiranagar") || lowerMsg.contains("namma")) {
            return "Bengaluru";
        }

        return "Noida"; // Default fallback city
    }

    private String generateGroundedAnswer(String query, String city, List<ScoredChunk> topChunks) {
        if (topChunks.isEmpty()) {
            return "I couldn't find specific knowledge base documents for your query. For emergency assistance in " + city + ", call 112 directly.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📍 **SettleIn ").append(city).append(" Local Guide**\n\n");

        for (ScoredChunk sc : topChunks) {
            CityKnowledgeChunk chunk = sc.getChunk();
            sb.append("🔹 **").append(chunk.getTitle()).append("**:\n");
            sb.append(chunk.getContent()).append("\n\n");
        }

        sb.append("💡 *Tip: Need instant emergency response? Call 112 for police dispatch or 1090 for Women Power Line.*");
        return sb.toString();
    }

    private double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length == 0 || vectorB.length == 0 || vectorA.length != vectorB.length) {
            return 0.5;
        }
        double dotProduct = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }
        if (normA == 0 || normB == 0) return 0.5;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private static class ScoredChunk {
        private final CityKnowledgeChunk chunk;
        private final double similarity;

        public ScoredChunk(CityKnowledgeChunk chunk, double similarity) {
            this.chunk = chunk;
            this.similarity = similarity;
        }

        public CityKnowledgeChunk getChunk() { return chunk; }
        public double getSimilarity() { return similarity; }
    }
}
