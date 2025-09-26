package com.app.deskly.service;

import com.app.deskly.model.Role;
import com.app.deskly.model.User;
import com.app.deskly.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private AuthService authService;
    private User testUser;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, "test-secret-key-for-jwt-token-generation");
        passwordEncoder = new BCryptPasswordEncoder();

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@email.com");
        testUser.setPasswordHash(passwordEncoder.encode("password123"));
        testUser.setRole(Role.ADMIN);
        testUser.setActive(true);
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(testUser));

        String token = authService.login("test@email.com", "password123");

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> authService.login("nonexistent@email.com", "password123")
        );

        assertEquals("Credenciais inválidas", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenUserIsInactive() {
        testUser.setActive(false);
        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> authService.login("test@email.com", "password123")
        );

        assertEquals("Credenciais inválidas", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsIncorrect() {
        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> authService.login("test@email.com", "wrongpassword")
        );

        assertEquals("Credenciais inválidas", exception.getMessage());
    }

    @Test
    void shouldGenerateTokenWithCorrectClaims() {
        String token = authService.generateToken(testUser);

        assertNotNull(token);

        Claims claims = authService.validateToken(token);
        assertEquals("1", claims.getSubject());
        assertEquals("test@email.com", claims.get("email"));
        assertEquals("ADMIN", claims.get("role"));
        assertNotNull(claims.getIssuedAt());
        assertNotNull(claims.getExpiration());
    }

    @Test
    void shouldValidateTokenSuccessfully() {
        String token = authService.generateToken(testUser);

        Claims claims = authService.validateToken(token);

        assertNotNull(claims);
        assertEquals("1", claims.getSubject());
    }

    @Test
    void shouldGetUserFromValidToken() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        String token = authService.generateToken(testUser);

        Optional<User> result = authService.getUserFromToken(token);

        assertTrue(result.isPresent());
        assertEquals(testUser.getEmail(), result.get().getEmail());
    }

    @Test
    void shouldReturnEmptyWhenTokenIsInvalid() {
        String invalidToken = "invalid.token.here";

        Optional<User> result = authService.getUserFromToken(invalidToken);

        assertTrue(result.isEmpty());
    }

    @Test
    void shouldReturnEmptyWhenUserNotFoundFromToken() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());
        String token = authService.generateToken(testUser);

        Optional<User> result = authService.getUserFromToken(token);

        assertTrue(result.isEmpty());
    }
}