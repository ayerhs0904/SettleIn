package com.settlein.backend.repository;

import com.settlein.backend.entity.FlatmatePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlatmatePreferenceRepository extends JpaRepository<FlatmatePreference, Long> {
    Optional<FlatmatePreference> findByUserId(Long userId);
}
