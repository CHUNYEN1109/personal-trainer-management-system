package com.brad.personaltrainer.progress;

import com.brad.personaltrainer.trainerclient.TrainerClientRepository;
import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRepository;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.brad.personaltrainer.trophy.Trophy;
import com.brad.personaltrainer.trophy.TrophyRepository;
import com.brad.personaltrainer.trophy.TrophyType;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgressRecordService {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final ProgressRecordRepository progressRecordRepository;
    private final UserRepository userRepository;
    private final TrainerClientRepository trainerClientRepository;
    private final TrophyRepository trophyRepository;

    public ProgressRecordService(
            ProgressRecordRepository progressRecordRepository,
            UserRepository userRepository,
            TrainerClientRepository trainerClientRepository,
            TrophyRepository trophyRepository
    ) {
        this.progressRecordRepository = progressRecordRepository;
        this.userRepository = userRepository;
        this.trainerClientRepository = trainerClientRepository;
        this.trophyRepository = trophyRepository;
    }

    @Transactional
    public ProgressRecordResponse createProgressRecord(
            User trainer,
            CreateProgressRecordRequest request
    ) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can create progress records"
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
                    "Progress record can only be created for clients"
            );
        }

        if (!trainerClientRepository.existsByTrainerAndClientAndStatus(
                trainer,
                client,
                ACTIVE_STATUS
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Client is not an active client of this trainer"
            );
        }

        ProgressRecord progressRecord = new ProgressRecord();
        progressRecord.setClient(client);
        progressRecord.setTrainer(trainer);
        progressRecord.setWeight(request.weight());
        progressRecord.setBodyFat(request.bodyFat());
        progressRecord.setDietSuggestion(request.dietSuggestion());
        progressRecord.setRecordedAt(LocalDateTime.now());

        ProgressRecord savedRecord = progressRecordRepository.save(progressRecord);

        awardFirstProgressRecordedTrophy(client);

        return toResponse(savedRecord);
    }

    public List<ProgressRecordResponse> getTrainerProgressRecords(User trainer) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can view progress records"
            );
        }

        return progressRecordRepository.findByTrainerOrderByRecordedAtDesc(trainer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProgressRecordResponse> getClientProgressRecords(User client) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can view progress records"
            );
        }

        return progressRecordRepository.findByClientOrderByRecordedAtDesc(client)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void awardFirstProgressRecordedTrophy(User client) {
        if (trophyRepository.existsByClientAndType(
                client,
                TrophyType.FIRST_PROGRESS_RECORDED
        )) {
            return;
        }

        Trophy trophy = new Trophy();
        trophy.setClient(client);
        trophy.setType(TrophyType.FIRST_PROGRESS_RECORDED);
        trophy.setTitle("First Progress Recorded");
        trophy.setDescription("Received your first progress record from your trainer.");
        trophy.setAwardedAt(LocalDateTime.now());

        trophyRepository.save(trophy);
    }

    private ProgressRecordResponse toResponse(ProgressRecord progressRecord) {
        return new ProgressRecordResponse(
                progressRecord.getId(),
                progressRecord.getClient().getId(),
                progressRecord.getClient().getEmail(),
                progressRecord.getTrainer().getId(),
                progressRecord.getTrainer().getEmail(),
                progressRecord.getWeight(),
                progressRecord.getBodyFat(),
                progressRecord.getDietSuggestion(),
                progressRecord.getRecordedAt()
        );
    }
}