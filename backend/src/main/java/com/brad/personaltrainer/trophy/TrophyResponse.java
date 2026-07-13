package com.brad.personaltrainer.trophy;

import java.time.LocalDateTime;

public record TrophyResponse(
        Long id,
        Long clientId,
        String clientEmail,
        TrophyType type,
        String title,
        String description,
        LocalDateTime awardedAt
) {
}