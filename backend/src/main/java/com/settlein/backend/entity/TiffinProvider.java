package com.settlein.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tiffin_providers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TiffinProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String cuisineType; // e.g. North Indian, South Indian, Gujarati, Multi-Cuisine

    @ElementCollection
    @CollectionTable(name = "tiffin_dietary_options", joinColumns = @JoinColumn(name = "provider_id"))
    @Column(name = "dietary_option")
    @Builder.Default
    private List<String> dietaryOptions = new ArrayList<>(); // e.g. Pure Veg, Jain, Non-Veg, Vegan

    @Column(nullable = false)
    private Double pricePerMonth;

    @Column(nullable = false)
    private String area;

    @Column(nullable = false)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String contactPhone;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TiffinReview> reviews = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
