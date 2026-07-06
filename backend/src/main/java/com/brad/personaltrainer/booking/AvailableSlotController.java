package com.brad.personaltrainer.booking;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
public class AvailableSlotController {

    private final TrainingSlotService trainingSlotService;

    public AvailableSlotController(TrainingSlotService trainingSlotService) {
        this.trainingSlotService = trainingSlotService;
    }

    @GetMapping("/available")
    public List<TrainingSlotResponse> getAvailableSlots() {
        return trainingSlotService.getAvailableSlots();
    }
}