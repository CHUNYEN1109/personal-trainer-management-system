package com.brad.personaltrainer.progress;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {

    List<ProgressRecord> findByClientOrderByRecordedAtDesc(User client);

    List<ProgressRecord> findByTrainerOrderByRecordedAtDesc(User trainer);

    List<ProgressRecord> findByClientAndTrainerOrderByRecordedAtDesc(
            User client,
            User trainer
    );
}