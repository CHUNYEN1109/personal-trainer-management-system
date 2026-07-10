package com.brad.personaltrainer.clientpackage;

import com.brad.personaltrainer.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "client_packages")
@Getter
@Setter
public class ClientPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @Column(nullable = false)
    private Integer totalSessions;

    @Column(nullable = false)
    private Integer remainingSessions;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}