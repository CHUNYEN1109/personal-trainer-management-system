package com.brad.personaltrainer.trainerclient;

import java.time.LocalDateTime;

public record TrainerClientResponse(
        Long id,
        Long clientId,
        String clientEmail,
        String clientUsername,
        Long trainerId,
        String trainerEmail,
        String status,
        LocalDateTime createdAt
) {
}