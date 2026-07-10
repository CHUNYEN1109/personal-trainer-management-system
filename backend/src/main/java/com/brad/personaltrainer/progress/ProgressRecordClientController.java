package com.brad.personaltrainer.progress;

import com.brad.personaltrainer.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/progress")
public class ProgressRecordClientController {

    private final ProgressRecordService progressRecordService;

    public ProgressRecordClientController(ProgressRecordService progressRecordService) {
        this.progressRecordService = progressRecordService;
    }

    @GetMapping
    public List<ProgressRecordResponse> getClientProgressRecords(Authentication authentication) {
        User client = (User) authentication.getPrincipal();

        return progressRecordService.getClientProgressRecords(client);
    }
}