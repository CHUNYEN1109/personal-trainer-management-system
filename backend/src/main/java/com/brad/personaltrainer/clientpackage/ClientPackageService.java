package com.brad.personaltrainer.clientpackage;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRepository;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClientPackageService {

    private final ClientPackageRepository clientPackageRepository;
    private final UserRepository userRepository;

    public ClientPackageService(
            ClientPackageRepository clientPackageRepository,
            UserRepository userRepository
    ) {
        this.clientPackageRepository = clientPackageRepository;
        this.userRepository = userRepository;
    }

    public ClientPackageResponse createPackage(
            User trainer,
            CreateClientPackageRequest request
    ) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can create client packages"
            );
        }

        User client = userRepository.findById(request.clientId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found"
                ));

        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Package can only be created for clients"
            );
        }

        ClientPackage clientPackage = new ClientPackage();
        clientPackage.setClient(client);
        clientPackage.setTrainer(trainer);
        clientPackage.setTotalSessions(request.totalSessions());
        clientPackage.setRemainingSessions(request.totalSessions());
        clientPackage.setCreatedAt(LocalDateTime.now());

        ClientPackage savedPackage = clientPackageRepository.save(clientPackage);

        return toResponse(savedPackage);
    }

    public List<ClientPackageResponse> getTrainerPackages(User trainer) {
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only trainers can view client packages"
            );
        }

        return clientPackageRepository.findByTrainer(trainer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ClientPackageResponse> getClientPackages(User client) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can view their packages"
            );
        }

        return clientPackageRepository.findByClient(client)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ClientPackageResponse toResponse(ClientPackage clientPackage) {
        return new ClientPackageResponse(
                clientPackage.getId(),
                clientPackage.getClient().getId(),
                clientPackage.getClient().getEmail(),
                clientPackage.getTrainer().getId(),
                clientPackage.getTrainer().getEmail(),
                clientPackage.getTotalSessions(),
                clientPackage.getRemainingSessions(),
                clientPackage.getCreatedAt()
        );
    }
}