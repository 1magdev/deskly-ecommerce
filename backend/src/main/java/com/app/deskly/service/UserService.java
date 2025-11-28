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
        if (dto.getRole() == UserRoles.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Não é permitido criar usuários CUSTOMER através do backoffice");
        }

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
        // Informações pessoais
        user.setFullname(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setActive(true);

        // Campos de endereço, pagamento, telefone, gênero e data de nascimento
        // não são salvos para ADMIN e BACKOFFICE (apenas para CUSTOMER)

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

    public List<User> getAllBackofficeUsers() {
        return userRepository.findByRoleIn(List.of(UserRoles.ADMIN, UserRoles.BACKOFFICE));
    }

    public void updateUser(Long id, UpdateUserDTO dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        if (!(authentication.getPrincipal() instanceof User)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tipo de autenticação inválido");
        }

        User loggedUser = (User) authentication.getPrincipal();

        boolean isSameUser = user.getId().equals(loggedUser.getId());

        // Informações pessoais
        if (dto.getFullname() != null) {
            user.setFullname(dto.getFullname());
        }
        if (dto.getCpf() != null) {
            if (!CpfValidator.isValid(dto.getCpf())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido");
            }
            userRepository.findByCpf(dto.getCpf()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
                }
            });
            user.setCpf(dto.getCpf());
        }

        // Atualizar senha apenas se foi fornecida
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não coincidem.");
            }
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        if (!isSameUser && dto.getRole() != null) {
            if (dto.getRole() == UserRoles.CUSTOMER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Não é permitido alterar o role para CUSTOMER através do backoffice");
            }
            user.setRole(dto.getRole());
        }

        // Campos de endereço, pagamento, telefone, gênero e data de nascimento
        // não são atualizados para ADMIN e BACKOFFICE (apenas para CUSTOMER)

        userRepository.save(user);
    }

    public User enableDisable(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        user.setActive(active);
        userRepository.save(user);
        return user;
    }
}
