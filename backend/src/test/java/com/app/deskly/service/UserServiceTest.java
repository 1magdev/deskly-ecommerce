package com.app.deskly.service;

import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.UserRoles;
import com.app.deskly.model.user.User;
import com.app.deskly.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private UserRequestDTO validUserDto;

    @BeforeEach
    void setUp() {
        validUserDto = new UserRequestDTO();
        validUserDto.setFullname("João Silva");
        validUserDto.setEmail("joao@email.com");
        validUserDto.setCpf("11144477735");
        validUserDto.setPassword("password123");
        validUserDto.setConfirmPassword("password123");
        validUserDto.setRole(UserRoles.CUSTOMER);
    }

    @Test
    void shouldCreateUserSuccessfully() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(new User());

        User result = userService.create(validUserDto);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPasswordsDoNotMatch() {
        validUserDto.setConfirmPassword("differentPassword");

        assertThrows(ResponseStatusException.class, () -> userService.create(validUserDto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenCpfIsInvalid() {
        validUserDto.setCpf("12345678901");

        assertThrows(ResponseStatusException.class, () -> userService.create(validUserDto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenCpfAlreadyExists() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.of(new User()));

        assertThrows(ResponseStatusException.class, () -> userService.create(validUserDto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(new User()));

        assertThrows(ResponseStatusException.class, () -> userService.create(validUserDto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldEncryptPasswordWhenCreatingUser() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            assertTrue(encoder.matches("password123", user.getPasswordHash()));
            return user;
        });

        userService.create(validUserDto);
    }

    @Test
    void shouldSetUserAsActiveWhenCreating() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertTrue(user.isActive());
            return user;
        });

        userService.create(validUserDto);
    }

    @Test
    void shouldGetUserById() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getById(1L);

        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getById(999L));
    }

    @Test
    void shouldGetAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(new User(), new User()));

        List<User> result = userService.getAll(null);

        assertEquals(2, result.size());
    }

    @Test
    void shouldGetUsersByRole() {
        when(userRepository.findByRole(UserRoles.CUSTOMER)).thenReturn(List.of(new User()));

        List<User> result = userService.getAll(UserRoles.CUSTOMER);

        assertEquals(1, result.size());
        verify(userRepository).findByRole(UserRoles.CUSTOMER);
    }

    @Test
    void shouldToggleUserStatus() {
        User user = new User();
        user.setId(1L);
        user.setActive(true);

        when(userRepository.getById(1L)).thenReturn(user);

        userService.enableDisable(1L, false);

        assertFalse(user.isActive());
        verify(userRepository).save(user);
    }
}
