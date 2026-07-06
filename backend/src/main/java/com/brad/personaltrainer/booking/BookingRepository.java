package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findBySlot(TrainingSlot slot);

    List<Booking> findByClient(User client);
}