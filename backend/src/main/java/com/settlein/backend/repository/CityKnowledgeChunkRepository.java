package com.settlein.backend.repository;

import com.settlein.backend.entity.CityKnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CityKnowledgeChunkRepository extends JpaRepository<CityKnowledgeChunk, Long> {
    List<CityKnowledgeChunk> findByCityIgnoreCase(String city);
    List<CityKnowledgeChunk> findByCategoryIgnoreCase(String category);
}
