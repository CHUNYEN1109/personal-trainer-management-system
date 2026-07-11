package com.brad.personaltrainer.trainerclient;

import jakarta.validation.constraints.NotNull;

public record CreateTrainerClientRequest(
        @NotNull(message = "Client ID is required")
        Long clientId
) {
}