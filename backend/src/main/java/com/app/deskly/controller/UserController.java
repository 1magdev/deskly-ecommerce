package com.app.deskly.controller;

import com.app.deskly.dto.UpdateUserDTO;
import com.app.deskly.dto.UserRequestDTO;
import com.app.deskly.model.User;
import com.app.deskly.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<User> register(@RequestBody UserRequestDTO dto) {
        User user = userService.register(dto);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserDTO dto) {
        userService.updateUser(id, dto);
        return ResponseEntity.ok("Usuário atualizado com sucesso.");
    }

}

