package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrainingSlotService {

    private final TrainingSlotRepository trainingSlotRepository;

    public TrainingSlotService(TrainingSlotRepository trainingSlotRepository) {
        this.trainingSlotRepository = trainingSlotRepository;
    }

    // Methods for business logic
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

    public List<TrainingSlotResponse> getAvailableSlots() {
        return trainingSlotRepository.findByStatus(TrainingSlotStatus.AVAILABLE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TrainingSlotResponse> getTrainerSlots(User trainer) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can view their training slots"
            );
        }

        return trainingSlotRepository.findByTrainer(trainer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TrainingSlotResponse cancelSlot(User trainer, Long slotId) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can cancel training slots"
            );
        }

        TrainingSlot trainingSlot = trainingSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Training slot not found"
                ));

        if (!trainingSlot.getTrainer().getId().equals(trainer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only cancel your own training slots"
            );
        }

        if (trainingSlot.getStatus() != TrainingSlotStatus.AVAILABLE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only available slots can be cancelled"
            );
        }

        trainingSlot.setStatus(TrainingSlotStatus.CANCELLED);
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