package com.settlein.backend.repository;

import com.settlein.backend.entity.TiffinReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TiffinReviewRepository extends JpaRepository<TiffinReview, Long> {
    List<TiffinReview> findByProviderIdOrderByCreatedAtDesc(Long providerId);
}
