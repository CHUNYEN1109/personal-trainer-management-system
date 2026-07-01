package com.brad.personaltrainer.auth;

import com.brad.personaltrainer.user.AuthProvider;
import com.brad.personaltrainer.user.UserRole;

public record CurrentUserResponse(
    Long id,
    String email,
    String username,
    UserRole role,
    AuthProvider provider
) {

}
