package com.brad.personaltrainer.progress;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateProgressRecordRequest(
        @NotNull(message = "Client ID is required")
        Long clientId,

        @DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0")
        BigDecimal weight,

        @DecimalMin(value = "0.0", inclusive = false, message = "Body fat must be greater than 0")
        BigDecimal bodyFat,

        String dietSuggestion
) {
}