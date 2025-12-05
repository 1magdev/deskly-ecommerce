package com.app.deskly.controller;

import com.app.deskly.dto.user.UpdateUserDTO;
import com.app.deskly.dto.user.UserDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.user.User;
import com.app.deskly.model.UserRoles;
import com.app.deskly.service.AuthService;
import com.app.deskly.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        var authenticatedUser = authService.getUserFromToken(token)
                .orElseThrow();
        return ResponseEntity.ok(authenticatedUser);
    }


    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    @PostMapping()
    public ResponseEntity<User> create(@RequestBody UserRequestDTO dto) {
        User user = userService.create(dto);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateUserDTO dto) {
        userService.updateUser(id, dto);
        return ResponseEntity.ok("Usuário atualizado com sucesso.");
    }

    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    @GetMapping("/all/{role}")
    public ResponseEntity<List<UserDTO>> getAll(@PathVariable UserRoles role) {
        List<User> users = userService.getAll(role);
        List<UserDTO> userDTOs = users.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }

    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    @GetMapping("/backoffice")
    public ResponseEntity<List<UserDTO>> getBackofficeUsers() {
        List<User> users = userService.getAllBackofficeUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }

    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id,@RequestParam boolean active) {
        User user = userService.enableDisable(id, active);
        return ResponseEntity.ok(user);
    }

    ///// 
    
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(Long.valueOf(user.getId()));
        dto.setFullname(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setCpf(user.getCpf());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        return dto;
    }

}

