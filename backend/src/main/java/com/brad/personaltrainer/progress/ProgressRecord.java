package com.brad.personaltrainer.progress;

import com.brad.personaltrainer.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress")
@Getter
@Setter
public class ProgressRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "body_fat", precision = 4, scale = 2)
    private BigDecimal bodyFat;

    @Column(name = "diet_suggestion", columnDefinition = "TEXT")
    private String dietSuggestion;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}