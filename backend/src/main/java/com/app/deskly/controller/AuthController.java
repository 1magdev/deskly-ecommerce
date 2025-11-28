package com.app.deskly.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.deskly.dto.auth.AuthResponseDTO;
import com.app.deskly.dto.auth.LoginRequestDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.UserRoles;
import com.app.deskly.model.User;
import com.app.deskly.service.AuthService;
import com.app.deskly.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        String token = authService.login(loginRequest.getEmail(), loginRequest.getPassword());

        User user = authService.getUserFromToken(token).orElseThrow();
        AuthResponseDTO response = new AuthResponseDTO(token, user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRequestDTO userRequest) {      
      AuthResponseDTO userData = authService.register(userRequest);
      return ResponseEntity.ok(userData);

    }
}
