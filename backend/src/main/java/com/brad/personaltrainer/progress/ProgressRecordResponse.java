package com.brad.personaltrainer.progress;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProgressRecordResponse(
        Long id,
        Long clientId,
        String clientEmail,
        Long trainerId,
        String trainerEmail,
        BigDecimal weight,
        BigDecimal bodyFat,
        String dietSuggestion,
        LocalDateTime recordedAt
) {
}