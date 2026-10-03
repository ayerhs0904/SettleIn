package com.settlein.backend.entity;

import com.settlein.backend.config.VectorConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "flatmate_preferences")
public class FlatmatePreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String sleepSchedule;
    private String cookingHabit;
    private String cleanliness;
    private String workSchedule;
    private String dietaryPreference;
    private String smokingDrinking;
    private String guestsFrequency;

    private Double budget;
    private String preferredArea;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    @Convert(converter = VectorConverter.class)
    @Column(columnDefinition = "text")
    private float[] embedding;
}
