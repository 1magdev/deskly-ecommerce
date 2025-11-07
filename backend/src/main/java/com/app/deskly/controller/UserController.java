package com.app.deskly.controller;

import com.app.deskly.dto.user.UpdateUserDTO;
import com.app.deskly.dto.user.UserDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.User;
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
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String token) {
        System.out.println(token);
        long userId = authService.getUserIdFromToken(token.replace("Bearer ", ""));
      User user = userService.getById(userId);
        System.out.println("Profile of: " + userId);
      return ResponseEntity.ok(user);
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
    @GetMapping("/{role}")
    public ResponseEntity<List<UserDTO>> getAll(@PathVariable UserRoles role) {
        List<User> users = userService.getAll(role);
        List<UserDTO> userDTOs = users.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }

    ///// 
    
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullname(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setCpf(user.getCpf());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        return dto;
    }

}

