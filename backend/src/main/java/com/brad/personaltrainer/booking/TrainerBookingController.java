package com.brad.personaltrainer.booking;

import com.brad.personaltrainer.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}