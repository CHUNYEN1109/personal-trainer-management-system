package com.brad.personaltrainer.clientpackage;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateClientPackageRequest(
        @NotNull(message = "Client ID is required")
        Long clientId,

        @NotNull(message = "Total sessions is required")
        @Min(value = 1, message = "Total sessions must be at least 1")
        Integer totalSessions
) {
}