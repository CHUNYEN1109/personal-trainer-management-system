package com.brad.personaltrainer.progress;

import com.brad.personaltrainer.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/progress")
public class ProgressRecordTrainerController {

    private final ProgressRecordService progressRecordService;

    public ProgressRecordTrainerController(ProgressRecordService progressRecordService) {
        this.progressRecordService = progressRecordService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressRecordResponse createProgressRecord(
            Authentication authentication,
            @Valid @RequestBody CreateProgressRecordRequest request
    ) {
        User trainer = (User) authentication.getPrincipal();

        return progressRecordService.createProgressRecord(trainer, request);
    }

    @GetMapping
    public List<ProgressRecordResponse> getTrainerProgressRecords(Authentication authentication) {
        User trainer = (User) authentication.getPrincipal();

        return progressRecordService.getTrainerProgressRecords(trainer);
    }
}