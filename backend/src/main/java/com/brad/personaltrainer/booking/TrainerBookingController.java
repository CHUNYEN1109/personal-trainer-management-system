package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/bookings")
public class TrainerBookingController {

    private final BookingService bookingService;

    public TrainerBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<BookingResponse> getTrainerBookings(Authentication authentication) {
        User trainer = (User) authentication.getPrincipal();
        return bookingService.getTrainerBookings(trainer);
    }

    @PatchMapping("/{bookingId}/confirm")
    public BookingResponse confirmBooking(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        User trainer = (User) authentication.getPrincipal();
        return bookingService.confirmBooking(trainer, bookingId);
    }

    @PatchMapping("/{bookingId}/reject")
    public BookingResponse rejectBooking(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        User trainer = (User) authentication.getPrincipal();
        return bookingService.rejectBooking(trainer, bookingId);
    }

    @PatchMapping("/{bookingId}/complete")
    public BookingResponse completeBooking(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        User trainer = (User) authentication.getPrincipal();
        return bookingService.completeBooking(trainer, bookingId);
    }
}