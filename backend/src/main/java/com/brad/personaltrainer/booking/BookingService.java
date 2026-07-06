package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

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
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now());

        slot.setStatus(TrainingSlotStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);
        trainingSlotRepository.save(slot);

        return toResponse(savedBooking);
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