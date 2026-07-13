package com.brad.personaltrainer.trophy;

import com.brad.personaltrainer.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "trophies",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_client_trophy_type",
                        columnNames = {"client_id", "type"}
                )
        }
)
public class Trophy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TrophyType type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "awarded_at", nullable = false)
    private LocalDateTime awardedAt;
}