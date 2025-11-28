/*
package com.app.deskly.service;

import com.app.deskly.dto.auth.AuthResponseDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.user.AuthenticatedUser;
import com.app.deskly.model.user.Customer;
import com.app.deskly.model.user.User;
import com.app.deskly.model.UserRoles;
import com.app.deskly.repository.CustomerRepository;
import com.app.deskly.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private AuthService authService;

    private User user;
    private Customer customer;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtSecret", "my-super-secret-key-for-testing-purposes-must-be-long-enough");
        ReflectionTestUtils.setField(authService, "jwtExpiration", 3600L);
        authService.init();

        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(UserRoles.ADMIN);
        user.setActive(true);

        customer = new Customer();
        customer.setId(2L);
        customer.setEmail("customer@test.com");
        customer.setPasswordHash(passwordEncoder.encode("password123"));
        customer.setActive(true);
    }

    @Test
    void shouldLoginSuccessfully() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        String token = authService.login("user@test.com", "password123");

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("invalid@test.com")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
            () -> authService.login("invalid@test.com", "password123"));
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsWrong() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class,
            () -> authService.login("user@test.com", "wrongPassword"));
    }

    @Test
    void shouldThrowExceptionWhenUserIsInactive() {
        user.setActive(false);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class,
            () -> authService.login("user@test.com", "password123"));
    }

    @Test
    void shouldRegisterCustomerSuccessfully() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setEmail("new@test.com");
        dto.setPassword("password123");
        dto.setRole(UserRoles.CUSTOMER);

        when(customerService.create(any(UserRequestDTO.class))).thenReturn(customer);

        AuthResponseDTO response = authService.register(dto);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("customer@test.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
    }

    @Test
    void shouldThrowExceptionWhenRegisteringAsAdmin() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setRole(UserRoles.ADMIN);

        assertThrows(IllegalArgumentException.class, () -> authService.register(dto));
        verify(customerService, never()).create(any());
    }

    @Test
    void shouldThrowExceptionWhenRegisteringAsBackoffice() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setRole(UserRoles.BACKOFFICE);

        assertThrows(IllegalArgumentException.class, () -> authService.register(dto));
        verify(customerService, never()).create(any());
    }

    @Test
    void shouldGenerateValidToken() {
        String token = authService.generateToken(user);

        assertNotNull(token);
        Claims claims = authService.validateToken(token);
        assertEquals("1", claims.getSubject());
        assertEquals("user@test.com", claims.get("email"));
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    void shouldExtractUserIdFromToken() {
        String token = authService.generateToken(user);

        Long userId = authService.getUserIdFromToken(token);

        assertEquals(1L, userId);
    }

    @Test
    void shouldGetUserFromToken() {
        String token = authService.generateToken(user);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<BaseUser> result = authService.getUserFromToken(token);

        assertTrue(result.isPresent());
        assertEquals("user@test.com", result.get().getEmail());
    }

    @Test
    void shouldReturnEmptyWhenTokenIsInvalid() {
        Optional<BaseUser> result = authService.getUserFromToken("invalid-token");

        assertTrue(result.isEmpty());
    }
}
*/
