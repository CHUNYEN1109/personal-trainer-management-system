package com.brad.personaltrainer.trainerclient;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainerClientRepository extends JpaRepository<TrainerClient, Long> {

    boolean existsByTrainerAndClient(User trainer, User client);

    List<TrainerClient> findByTrainerOrderByCreatedAtDesc(User trainer);

    Optional<TrainerClient> findByIdAndTrainer(Long id, User trainer);

}