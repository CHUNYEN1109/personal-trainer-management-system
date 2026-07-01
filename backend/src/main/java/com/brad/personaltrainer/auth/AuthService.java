package com.brad.personaltrainer.auth;

import com.brad.personaltrainer.user.AuthProvider;
import com.brad.personaltrainer.user.User;
import com.brad.personaltrainer.user.UserRepository;
import com.brad.personaltrainer.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    //Constructor
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request){
        String normalizedEmail = request.email().trim().toLowerCase();
        // check whether if the account is existed
        if(userRepository.existsByEmail(normalizedEmail)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered.");
        }
        // Set user detail
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setUsername(request.username().trim());
        user.setRole(request.role());
        user.setProvider(AuthProvider.LOCAL);
        user.setProviderId(null);
        user.setProfileImageUrl(null);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        // Store into repository
        User savedUser= userRepository.save(user);
        // return user info
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getProvider(),
                token
        );

    }

    // Login
    public AuthResponse login(LoginRequest request){
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if(user.getProvider() != AuthProvider.LOCAL){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login with your original provider");
        }

        if(!passwordEncoder.matches(request.password(), user.getPasswordHash())){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getProvider(),
                token
        );
    }
}
