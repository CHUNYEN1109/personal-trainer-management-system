package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TrainingSlotRepository trainingSlotRepository;

    public BookingService(
            BookingRepository bookingRepository,
            TrainingSlotRepository trainingSlotRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.trainingSlotRepository = trainingSlotRepository;
    }

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

    public List<BookingResponse> getClientBookings(User client) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can view their bookings"
            );
        }

        return bookingRepository.findByClient(client)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse confirmBooking(User trainer, Long bookingId) {
        Booking booking = getTrainerPendingBooking(trainer, bookingId);

        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    public BookingResponse rejectBooking(User trainer, Long bookingId) {
        Booking booking = getTrainerPendingBooking(trainer, bookingId);

        booking.setStatus(BookingStatus.REJECTED);
        booking.getSlot().setStatus(TrainingSlotStatus.AVAILABLE);

        Booking savedBooking = bookingRepository.save(booking);
        trainingSlotRepository.save(booking.getSlot());

        return toResponse(savedBooking);
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

    public List<BookingResponse> getTrainerBookings(User trainer) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can view their bookings"
            );
        }

        return bookingRepository.findBySlotTrainer(trainer)
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