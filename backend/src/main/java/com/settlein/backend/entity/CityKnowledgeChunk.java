package com.settlein.backend.entity;

import com.settlein.backend.config.VectorConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "city_knowledge_chunks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityKnowledgeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String city; // e.g. Noida, Delhi, Bengaluru

    @Column(nullable = false)
    private String category; // e.g. Transport, Safety, Area Guide, Renting

    @Column(nullable = false)
    private String title; // Chunk heading

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // Knowledge content body

    @Convert(converter = VectorConverter.class)
    @Column(columnDefinition = "TEXT")
    private float[] embedding; // Dense vector embedding for RAG vector search

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
