package com.brad.personaltrainer.booking;

import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        Long clientId,
        String clientEmail,
        Long slotId,
        Long trainerId,
        String trainerEmail,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BookingStatus status,
        LocalDateTime createdAt
) {}