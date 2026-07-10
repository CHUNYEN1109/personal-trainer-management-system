package com.brad.personaltrainer.clientpackage;

import com.brad.personaltrainer.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/packages")
public class ClientPackageController {

    private final ClientPackageService clientPackageService;

    public ClientPackageController(ClientPackageService clientPackageService) {
        this.clientPackageService = clientPackageService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientPackageResponse createPackage(
            Authentication authentication,
            @Valid @RequestBody CreateClientPackageRequest request
    ) {
        User trainer = (User) authentication.getPrincipal();

        return clientPackageService.createPackage(trainer, request);
    }

    @GetMapping
    public List<ClientPackageResponse> getTrainerPackages(Authentication authentication) {
        User trainer = (User) authentication.getPrincipal();

        return clientPackageService.getTrainerPackages(trainer);
    }
}