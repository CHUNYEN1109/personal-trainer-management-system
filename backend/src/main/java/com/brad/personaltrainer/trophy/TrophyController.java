package com.brad.personaltrainer.trophy;

import com.brad.personaltrainer.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/trophies")
public class TrophyController {

    private final TrophyService trophyService;

    public TrophyController(TrophyService trophyService) {
        this.trophyService = trophyService;
    }

    @GetMapping
    public List<TrophyResponse> getClientTrophies(Authentication authentication) {
        User client = (User) authentication.getPrincipal();

        return trophyService.getClientTrophies(client);
    }
}