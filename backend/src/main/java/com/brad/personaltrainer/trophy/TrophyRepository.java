package com.brad.personaltrainer.trophy;

import com.brad.personaltrainer.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrophyRepository extends JpaRepository<Trophy, Long> {

    boolean existsByClientAndType(User client, TrophyType type);

    List<Trophy> findByClientOrderByAwardedAtDesc(User client);
}