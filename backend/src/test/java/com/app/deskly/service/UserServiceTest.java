package com.app.deskly.service;

import com.app.deskly.dto.UserRequestDTO;
import com.app.deskly.model.Role;
import com.app.deskly.model.User;
import com.app.deskly.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
        validUserDto.setRole(Role.ADMIN);
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(new User());

        User result = userService.register(validUserDto);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPasswordsDoNotMatch() {
        validUserDto.setConfirmPassword("differentPassword");

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.register(validUserDto)
        );

        assertEquals("senhas não coincidem", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenCpfIsInvalid() {
        validUserDto.setCpf("12345678901");

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.register(validUserDto)
        );

        assertEquals("CPF inválido", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenCpfAlreadyExists() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.of(new User()));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.register(validUserDto)
        );

        assertEquals("CPF já cadastrado", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(new User()));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.register(validUserDto)
        );

        assertEquals("email já cadastrado", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldEncryptPasswordWhenRegisteringUser() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            assertTrue(encoder.matches("password123", user.getPasswordHash()));
            return user;
        });

        userService.register(validUserDto);
    }

    @Test
    void shouldSetUserAsActiveWhenRegistering() {
        when(userRepository.findByCpf(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertTrue(user.isActive());
            return user;
        });

        userService.register(validUserDto);
    }
}