package com.brad.personaltrainer.clientpackage;

import com.brad.personaltrainer.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/packages")
public class ClientPackageClientController {

    private final ClientPackageService clientPackageService;

    public ClientPackageClientController(ClientPackageService clientPackageService) {
        this.clientPackageService = clientPackageService;
    }

    @GetMapping
    public List<ClientPackageResponse> getClientPackages(Authentication authentication) {
        User client = (User) authentication.getPrincipal();

        return clientPackageService.getClientPackages(client);
    }
}