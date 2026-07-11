package com.brad.personaltrainer.trainerclient;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainerClientRepository extends JpaRepository<TrainerClient, Long> {

    boolean existsByTrainerAndClient(User trainer, User client);

    List<TrainerClient> findByTrainerOrderByCreatedAtDesc(User trainer);
}