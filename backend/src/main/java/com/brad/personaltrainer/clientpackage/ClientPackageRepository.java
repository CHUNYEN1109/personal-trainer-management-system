package com.brad.personaltrainer.clientpackage;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientPackageRepository extends JpaRepository<ClientPackage, Long> {
    List<ClientPackage> findByClient(User client);

    List<ClientPackage> findByTrainer(User trainer);

    List<ClientPackage> findByTrainerAndClientOrderByCreatedAtDesc(
            User trainer,
            User client
    );

    Optional<ClientPackage> findFirstByClientAndRemainingSessionsGreaterThanOrderByCreatedAtAsc(
            User client,
            Integer remainingSessions
    );
}