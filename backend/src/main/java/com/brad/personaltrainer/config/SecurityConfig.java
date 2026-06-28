package com.brad.personaltrainer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for REST API testing during MVP development
                .csrf(csrf -> csrf.disable())

                // Define which endpoints are public and which require login
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health").permitAll()
                        .anyRequest().authenticated()
                )

                // Enable HTTP Basic authentication for simple backend testing
                .httpBasic(httpBasic -> {});

        return http.build();
    }
}
