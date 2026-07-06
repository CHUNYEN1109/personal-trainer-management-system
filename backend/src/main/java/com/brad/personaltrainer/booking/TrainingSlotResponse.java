package com.brad.personaltrainer.booking;

import java.time.LocalDateTime;

public record TrainingSlotResponse(
        Long id,
        Long trainerId,
        String trainerEmail,
        LocalDateTime startTime,
        LocalDateTime endTime,
        TrainingSlotStatus status,
        LocalDateTime createdAt
) {
}
