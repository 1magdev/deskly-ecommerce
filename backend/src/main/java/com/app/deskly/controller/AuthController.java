package com.app.deskly.controller;

import com.app.deskly.dto.auth.AuthResponseDTO;
import com.app.deskly.dto.auth.LoginRequestDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.user.AuthenticatedUser;
import com.app.deskly.model.user.User;
import com.app.deskly.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        String token = authService.login(loginRequest.getEmail(), loginRequest.getPassword());

        AuthenticatedUser user = authService.getUserFromToken(token).orElseThrow(
        );
        AuthResponseDTO response = new AuthResponseDTO(token, user.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRequestDTO userRequest) {      
      AuthResponseDTO userData = authService.register(userRequest);
      return ResponseEntity.ok(userData);

    }
}
