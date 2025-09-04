package com.app.deskly.service;

import com.app.deskly.dto.UserRequestDTO;
import com.app.deskly.model.User;
import com.app.deskly.repository.UserRepository;
import com.app.deskly.util.CpfValidator;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    public User register(UserRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())){
            throw new IllegalArgumentException("senhas não coincidem");
        }
        if (!CpfValidator.isValid(dto.getCpf())){
            throw new IllegalArgumentException("CPF inválido");
        }
        if (userRepository.findByCpf(dto.getCpf()) != null){
            throw new IllegalArgumentException("CPF já cadastrado");
        }
        if (userRepository.findByEmail(dto.getEmail()) != null){
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
}
