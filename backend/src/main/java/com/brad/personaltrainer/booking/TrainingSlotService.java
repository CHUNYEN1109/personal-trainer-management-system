package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class TrainingSlotService {

    private final TrainingSlotRepository trainingSlotRepository;

    public TrainingSlotService(TrainingSlotRepository trainingSlotRepository) {
        this.trainingSlotRepository = trainingSlotRepository;
    }

    public TrainingSlotResponse createSlot(User trainer, CreateTrainingSlotRequest request) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can create training slots"
            );
        }

        if (!request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time"
            );
        }

        TrainingSlot trainingSlot = new TrainingSlot();
        trainingSlot.setTrainer(trainer);
        trainingSlot.setStartTime(request.startTime());
        trainingSlot.setEndTime(request.endTime());
        trainingSlot.setStatus(TrainingSlotStatus.AVAILABLE);
        trainingSlot.setCreatedAt(LocalDateTime.now());

        TrainingSlot savedSlot = trainingSlotRepository.save(trainingSlot);

        return toResponse(savedSlot);
    }

    private TrainingSlotResponse toResponse(TrainingSlot trainingSlot) {
        return new TrainingSlotResponse(
                trainingSlot.getId(),
                trainingSlot.getTrainer().getId(),
                trainingSlot.getTrainer().getEmail(),
                trainingSlot.getStartTime(),
                trainingSlot.getEndTime(),
                trainingSlot.getStatus(),
                trainingSlot.getCreatedAt()
        );
    }
}