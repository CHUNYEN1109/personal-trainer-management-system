package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/slots")
public class TrainingSlotController {

    private final TrainingSlotService trainingSlotService;

    public TrainingSlotController(TrainingSlotService trainingSlotService) {
        this.trainingSlotService = trainingSlotService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingSlotResponse createSlot(
            Authentication authentication,
            @Valid @RequestBody CreateTrainingSlotRequest request
    ) {
        User trainer = (User) authentication.getPrincipal();

        return trainingSlotService.createSlot(trainer, request);
    }

    @GetMapping
    public List<TrainingSlotResponse> getTrainerSlots(Authentication authentication) {
        User trainer = (User) authentication.getPrincipal();

        return trainingSlotService.getTrainerSlots(trainer);
    }

    @PatchMapping("/{slotId}/cancel")
    public TrainingSlotResponse cancelSlot(
            Authentication authentication,
            @PathVariable Long slotId
    ) {
        User trainer = (User) authentication.getPrincipal();

        return trainingSlotService.cancelSlot(trainer, slotId);
    }
}