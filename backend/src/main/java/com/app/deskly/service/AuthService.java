package com.app.deskly.service;

import com.app.deskly.exception.BadRequestException;
import com.app.deskly.model.User;
import com.app.deskly.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecretKey secretKey;

    @Value("${jwt.expiration:86400}")
    private long jwtExpiration;

    public AuthService(UserRepository userRepository,
            @Value("${jwt.secret:deskly-secret-key-change-in-production}") String jwtSecret) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !userOpt.get().isActive()) {
            throw new BadRequestException("Credenciais inválidas");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Credenciais inválidas");
        }

        return generateToken(user);
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(jwtExpiration, ChronoUnit.SECONDS);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(secretKey)
                .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Optional<User> getUserFromToken(String token) {
        try {
            Claims claims = validateToken(token);
            Long userId = Long.valueOf(claims.getSubject());
            return userRepository.findById(userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
