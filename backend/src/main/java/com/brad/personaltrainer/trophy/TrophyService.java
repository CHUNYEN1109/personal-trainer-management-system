package com.brad.personaltrainer.trophy;

import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TrophyService {

    private final TrophyRepository trophyRepository;

    public TrophyService(TrophyRepository trophyRepository) {
        this.trophyRepository = trophyRepository;
    }

    public List<TrophyResponse> getClientTrophies(User client) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only clients can view their trophies"
            );
        }

        return trophyRepository.findByClientOrderByAwardedAtDesc(client)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TrophyResponse toResponse(Trophy trophy) {
        return new TrophyResponse(
                trophy.getId(),
                trophy.getClient().getId(),
                trophy.getClient().getEmail(),
                trophy.getType(),
                trophy.getTitle(),
                trophy.getDescription(),
                trophy.getAwardedAt()
        );
    }
}