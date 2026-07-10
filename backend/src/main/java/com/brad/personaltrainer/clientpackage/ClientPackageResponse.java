package com.brad.personaltrainer.clientpackage;

import java.time.LocalDateTime;

public record ClientPackageResponse(
        Long id,
        Long clientId,
        String clientEmail,
        Long trainerId,
        String trainerEmail,
        Integer totalSessions,
        Integer remainingSessions,
        LocalDateTime createdAt
) {
}