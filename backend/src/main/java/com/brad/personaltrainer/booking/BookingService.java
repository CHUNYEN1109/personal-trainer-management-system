package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.clientpackage.ClientPackage;
import com.brad.personaltrainer.clientpackage.ClientPackageRepository;
import com.brad.personaltrainer.trophy.Trophy;
import com.brad.personaltrainer.trophy.TrophyRepository;
import com.brad.personaltrainer.trophy.TrophyType;
import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TrainingSlotRepository trainingSlotRepository;
    private final ClientPackageRepository clientPackageRepository;
    private final TrophyRepository trophyRepository;

    public BookingService(
            BookingRepository bookingRepository,
            TrainingSlotRepository trainingSlotRepository,
            ClientPackageRepository clientPackageRepository,
            TrophyRepository trophyRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.trainingSlotRepository = trainingSlotRepository;
        this.clientPackageRepository = clientPackageRepository;
        this.trophyRepository = trophyRepository;
    }

    @Transactional
    public BookingResponse createBooking(User client, CreateBookingRequest request) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can create bookings"
            );
        }

        TrainingSlot slot = trainingSlotRepository.findById(request.slotId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Training slot not found"
                ));

        if (slot.getStatus() != TrainingSlotStatus.AVAILABLE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Training slot is not available"
            );
        }

        if (bookingRepository.findBySlot(slot).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Training slot is already booked"
            );
        }

        Booking booking = new Booking();
        booking.setClient(client);
        booking.setSlot(slot);
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        slot.setStatus(TrainingSlotStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);
        trainingSlotRepository.save(slot);

        return toResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getClientBookings(User client) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can view their bookings"
            );
        }

        return bookingRepository.findByClientOrderBySlotStartTimeAsc(client)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse cancelClientBooking(User client, Long bookingId) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can cancel bookings"
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        if (!booking.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only cancel your own bookings"
            );
        }

        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending or confirmed bookings can be cancelled"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.getSlot().setStatus(TrainingSlotStatus.AVAILABLE);

        Booking savedBooking = bookingRepository.save(booking);
        trainingSlotRepository.save(booking.getSlot());

        return toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse confirmBooking(User trainer, Long bookingId) {
        Booking booking = getTrainerPendingBooking(trainer, bookingId);

        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse rejectBooking(User trainer, Long bookingId) {
        Booking booking = getTrainerPendingBooking(trainer, bookingId);

        booking.setStatus(BookingStatus.REJECTED);
        booking.getSlot().setStatus(TrainingSlotStatus.AVAILABLE);

        Booking savedBooking = bookingRepository.save(booking);
        trainingSlotRepository.save(booking.getSlot());

        return toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse completeBooking(User trainer, Long bookingId) {
        Booking booking = getTrainerConfirmedBooking(trainer, bookingId);

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking is already completed"
            );
        }

        ClientPackage clientPackage = clientPackageRepository
                .findFirstByClientAndRemainingSessionsGreaterThanOrderByCreatedAtAsc(
                        booking.getClient(),
                        0
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Client does not have remaining package sessions"
                ));

        clientPackage.setRemainingSessions(clientPackage.getRemainingSessions() - 1);
        booking.setStatus(BookingStatus.COMPLETED);

        clientPackageRepository.save(clientPackage);
        Booking savedBooking = bookingRepository.save(booking);

        awardCompletedSessionTrophies(savedBooking.getClient());

        return toResponse(savedBooking);
    }

    private void awardCompletedSessionTrophies(User client) {
        long completedBookings = bookingRepository.countByClientAndStatus(
                client,
                BookingStatus.COMPLETED
        );

        if (completedBookings >= 1) {
            awardTrophyIfNotExists(
                    client,
                    TrophyType.FIRST_SESSION_COMPLETED,
                    "First Session Completed",
                    "Completed your first training session."
            );
        }

        if (completedBookings >= 5) {
            awardTrophyIfNotExists(
                    client,
                    TrophyType.FIVE_SESSIONS_COMPLETED,
                    "Five Sessions Completed",
                    "Completed five training sessions."
            );
        }

        if (completedBookings >= 10) {
            awardTrophyIfNotExists(
                    client,
                    TrophyType.TEN_SESSIONS_COMPLETED,
                    "Ten Sessions Completed",
                    "Completed ten training sessions."
            );
        }
    }

    private void awardTrophyIfNotExists(
            User client,
            TrophyType type,
            String title,
            String description
    ) {
        if (trophyRepository.existsByClientAndType(client, type)) {
            return;
        }

        Trophy trophy = new Trophy();
        trophy.setClient(client);
        trophy.setType(type);
        trophy.setTitle(title);
        trophy.setDescription(description);
        trophy.setAwardedAt(LocalDateTime.now());

        trophyRepository.save(trophy);
    }

    private Booking getTrainerPendingBooking(User trainer, Long bookingId) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can manage bookings"
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        if (!booking.getSlot().getTrainer().getId().equals(trainer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only manage bookings for your own slots"
            );
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending bookings can be confirmed or rejected"
            );
        }

        return booking;
    }

    private Booking getTrainerConfirmedBooking(User trainer, Long bookingId) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can complete bookings"
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        if (!booking.getSlot().getTrainer().getId().equals(trainer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only complete bookings for your own slots"
            );
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only confirmed bookings can be completed"
            );
        }

        return booking;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getTrainerBookings(User trainer) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can view their bookings"
            );
        }

        return bookingRepository.findBySlotTrainerOrderBySlotStartTimeAsc(trainer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private BookingResponse toResponse(Booking booking) {
        TrainingSlot slot = booking.getSlot();

        return new BookingResponse(
                booking.getId(),
                booking.getClient().getId(),
                booking.getClient().getEmail(),
                slot.getId(),
                slot.getTrainer().getId(),
                slot.getTrainer().getEmail(),
                slot.getStartTime(),
                slot.getEndTime(),
                booking.getStatus(),
                booking.getCreatedAt()
        );
    }
}