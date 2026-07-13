package com.brad.personaltrainer.clientpackage;

import com.brad.personaltrainer.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/clients")
public class TrainerClientPackageController {

    private final ClientPackageService clientPackageService;

    public TrainerClientPackageController(ClientPackageService clientPackageService) {
        this.clientPackageService = clientPackageService;
    }

    @GetMapping("/{trainerClientId}/packages")
    public List<ClientPackageResponse> getTrainerClientPackages(
            Authentication authentication,
            @PathVariable Long trainerClientId
    ) {
        User trainer = (User) authentication.getPrincipal();

        return clientPackageService.getTrainerClientPackages(
                trainer,
                trainerClientId
        );
    }
}