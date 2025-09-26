package com.app.deskly.controller;

import com.app.deskly.dto.AuthResponseDTO;
import com.app.deskly.dto.LoginRequestDTO;
import com.app.deskly.dto.UserRequestDTO;
import com.app.deskly.model.Role;
import com.app.deskly.model.User;
import com.app.deskly.service.AuthService;
import com.app.deskly.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        String token = authService.login(loginRequest.getEmail(), loginRequest.getPassword());

        User user = authService.getUserFromToken(token).orElseThrow();
        AuthResponseDTO response = new AuthResponseDTO(token, user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRequestDTO userRequest) {
        if (userRequest.getRole() == Role.ADMIN || userRequest.getRole() == Role.ESTOQUISTA) {
            throw new IllegalArgumentException("Não é possível se registrar como ADMIN ou ESTOQUISTA");
        }

        User user = userService.register(userRequest);
        String token = authService.generateToken(user);

        AuthResponseDTO response = new AuthResponseDTO(token, user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(response);
    }
}
