package com.brad.personaltrainer.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RoleTestController {

    @GetMapping("/api/test/client")
    public Map<String, String> clientOnly() {
        return Map.of(
                "message", "CLIENT access granted"
        );
    }

    @GetMapping("/api/test/trainer")
    public Map<String, String> trainerOnly() {
        return Map.of(
                "message", "TRAINER access granted"
        );
    }
}
