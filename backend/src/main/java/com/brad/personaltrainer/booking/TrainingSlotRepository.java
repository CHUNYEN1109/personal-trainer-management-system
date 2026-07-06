package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainingSlotRepository extends JpaRepository<TrainingSlot, Long>{
    List<TrainingSlot> findByTrainer(User trainer);

    List<TrainingSlot> findByStatus(TrainingSlotStatus status);
}
