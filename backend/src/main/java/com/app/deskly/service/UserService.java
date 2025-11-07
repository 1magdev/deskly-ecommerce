package com.app.deskly.service;

import com.app.deskly.dto.user.UpdateUserDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.User;
import com.app.deskly.model.UserRoles;
import com.app.deskly.repository.UserRepository;
import com.app.deskly.util.CpfValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User create(UserRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "senhas não coincidem");
        }

        if (!CpfValidator.isValid(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido");
        }

        if (userRepository.findByCpf(dto.getCpf()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email já cadastrado");
        }

        User user = new User();
        user.setFullname(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setActive(true);

        return userRepository.save(user);
    }

    public User getById(long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public List<User> getAll(UserRoles role) {
        if (role != null) {
            return userRepository.findByRole(role);
        }

        return userRepository.findAll();
    }

    public void updateUser(Long id, UpdateUserDTO dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedEmail = authentication.getName();
        User loggedUser = userRepository.findByEmail(loggedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário logado não encontrado"));

        boolean isSameUser = user.getId().equals(loggedUser.getId());

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não coincidem.");
        }
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        user.setFullname(dto.getFullname());
        user.setCpf(dto.getCpf());
        user.setPasswordHash(encodedPassword);
        if (!isSameUser) {
            user.setRole(dto.getRole());
        }

        userRepository.save(user);
    }

}
