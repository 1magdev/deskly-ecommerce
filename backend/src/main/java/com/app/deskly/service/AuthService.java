package com.app.deskly.service;

import com.app.deskly.dto.auth.AuthResponseDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.user.User;
import com.app.deskly.model.UserRoles;
import com.app.deskly.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();;

    @Value("${env.jwt.expiration}")
    private long jwtExpiration;
    @Value("${env.jwt.secret}")
    private String jwtSecret;
    private SecretKey jwtSecretKey;

    @PostConstruct
    public void init() {
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !userOpt.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
        }

        return generateToken(user);
    }

    public AuthResponseDTO register(UserRequestDTO userData){
       if (userData.getRole() != UserRoles.CUSTOMER) {
            throw new IllegalArgumentException("Não é possível se registrar como ADMIN ou ESTOQUISTA");
        }

        User user = userService.create(userData);
        String token = this.generateToken(user);

        AuthResponseDTO response = new AuthResponseDTO(token, user.getEmail(), user.getRole().name());

        return response;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(this.jwtExpiration, ChronoUnit.SECONDS);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(jwtSecretKey)
                .compact();
    }

    public Claims validateToken(String token) {

        return Jwts.parser()
                .verifyWith(jwtSecretKey)
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

    public Long getUserIdFromToken(String token) {
            Claims claims = validateToken(token);
            return Long.valueOf(claims.getSubject());
    }
}
