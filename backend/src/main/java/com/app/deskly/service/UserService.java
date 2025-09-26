package com.app.deskly.service;

import com.app.deskly.dto.UpdateUserDTO;
import com.app.deskly.dto.UserRequestDTO;
import com.app.deskly.model.User;
import com.app.deskly.repository.UserRepository;
import com.app.deskly.util.CpfValidator;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(UserRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("senhas não coincidem");
        }

        if (!CpfValidator.isValid(dto.getCpf())) {
            throw new IllegalArgumentException("CPF inválido");
        }

        if (userRepository.findByCpf(dto.getCpf()).isPresent()) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("email já cadastrado");
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

    public void updateUser(Long id, UpdateUserDTO dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedEmail = authentication.getName();
        User loggedUser = userRepository.findByEmail(loggedEmail)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado"));

        boolean isSameUser = user.getId().equals(loggedUser.getId());

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("As senhas não coincidem.");
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
