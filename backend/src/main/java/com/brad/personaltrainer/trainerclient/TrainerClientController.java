package com.brad.personaltrainer.trainerclient;

import com.brad.personaltrainer.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/clients")
public class TrainerClientController {

    private final TrainerClientService trainerClientService;

    public TrainerClientController(TrainerClientService trainerClientService) {
        this.trainerClientService = trainerClientService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainerClientResponse addClient(
            Authentication authentication,
            @Valid @RequestBody CreateTrainerClientRequest request
    ) {
        User trainer = (User) authentication.getPrincipal();

        return trainerClientService.addClient(trainer, request);
    }

    @GetMapping
    public List<TrainerClientResponse> getTrainerClients(Authentication authentication) {
        User trainer = (User) authentication.getPrincipal();

        return trainerClientService.getTrainerClients(trainer);
    }

    @PatchMapping("/{trainerClientId}/deactivate")
    public TrainerClientResponse deactivateClient(
            Authentication authentication,
            @PathVariable Long trainerClientId
    ) {
        User trainer = (User) authentication.getPrincipal();

        return trainerClientService.deactivateClient(trainer, trainerClientId);
    }
}