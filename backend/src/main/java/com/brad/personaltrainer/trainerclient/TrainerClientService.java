package com.brad.personaltrainer.trainerclient;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRepository;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TrainerClientService {

    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final String INACTIVE_STATUS = "INACTIVE";

    private final TrainerClientRepository trainerClientRepository;
    private final UserRepository userRepository;

    public TrainerClientService(
            TrainerClientRepository trainerClientRepository,
            UserRepository userRepository
    ) {
        this.trainerClientRepository = trainerClientRepository;
        this.userRepository = userRepository;
    }

    public TrainerClientResponse addClient(
            User trainer,
            CreateTrainerClientRequest request
    ) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can add clients"
            );
        }

        User client = userRepository.findById(request.clientId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found"
                ));

        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only users with CLIENT role can be added as clients"
            );
        }

        Optional<TrainerClient> existingTrainerClient =
                trainerClientRepository.findByTrainerAndClient(trainer, client);

        if (existingTrainerClient.isPresent()) {
            TrainerClient trainerClient = existingTrainerClient.get();

            if (ACTIVE_STATUS.equals(trainerClient.getStatus())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Client is already assigned to this trainer"
                );
            }

            trainerClient.setStatus(ACTIVE_STATUS);

            TrainerClient savedTrainerClient = trainerClientRepository.save(trainerClient);

            return toResponse(savedTrainerClient);
        }

        TrainerClient trainerClient = new TrainerClient();
        trainerClient.setTrainer(trainer);
        trainerClient.setClient(client);
        trainerClient.setStatus(ACTIVE_STATUS);
        trainerClient.setCreatedAt(LocalDateTime.now());

        TrainerClient savedTrainerClient = trainerClientRepository.save(trainerClient);

        return toResponse(savedTrainerClient);
    }

    public List<TrainerClientResponse> getTrainerClients(User trainer) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can view their clients"
            );
        }

        return trainerClientRepository.findByTrainerOrderByCreatedAtDesc(trainer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TrainerClientResponse deactivateClient(
            User trainer,
            Long trainerClientId
    ) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can deactivate clients"
            );
        }

        TrainerClient trainerClient = trainerClientRepository
                .findByIdAndTrainer(trainerClientId, trainer)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trainer client relationship not found"
                ));

        trainerClient.setStatus(INACTIVE_STATUS);

        TrainerClient savedTrainerClient = trainerClientRepository.save(trainerClient);

        return toResponse(savedTrainerClient);
    }

    public TrainerClientResponse reactivateClient(
            User trainer,
            Long trainerClientId
    ) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can reactivate clients"
            );
        }

        TrainerClient trainerClient = trainerClientRepository
                .findByIdAndTrainer(trainerClientId, trainer)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Trainer client relationship not found"
                ));

        trainerClient.setStatus(ACTIVE_STATUS);

        TrainerClient savedTrainerClient = trainerClientRepository.save(trainerClient);

        return toResponse(savedTrainerClient);
    }

    private TrainerClientResponse toResponse(TrainerClient trainerClient) {
        return new TrainerClientResponse(
                trainerClient.getId(),
                trainerClient.getClient().getId(),
                trainerClient.getClient().getEmail(),
                trainerClient.getClient().getUsername(),
                trainerClient.getTrainer().getId(),
                trainerClient.getTrainer().getEmail(),
                trainerClient.getStatus(),
                trainerClient.getCreatedAt()
        );
    }
}