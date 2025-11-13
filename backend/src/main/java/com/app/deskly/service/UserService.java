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
        // Informações pessoais
        user.setFullname(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setGender(dto.getGender());
        user.setBirthDate(dto.getBirthDate());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setActive(true);

        // Endereço de entrega
        user.setAddressStreet(dto.getAddressStreet());
        user.setAddressNumber(dto.getAddressNumber());
        user.setAddressComplement(dto.getAddressComplement());
        user.setAddressNeighborhood(dto.getAddressNeighborhood());
        user.setAddressCity(dto.getAddressCity());
        user.setAddressState(dto.getAddressState());
        user.setAddressZipcode(dto.getAddressZipcode());

        // Informações de pagamento
        user.setCardHolderName(dto.getCardHolderName());
        user.setCardLastDigits(dto.getCardLastDigits());
        user.setCardBrand(dto.getCardBrand());
        user.setCardExpiration(dto.getCardExpiration());

        // Contato adicional
        user.setPhone(dto.getPhone());

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

        // Informações pessoais
        if (dto.getFullname() != null) {
            user.setFullname(dto.getFullname());
        }
        if (dto.getCpf() != null) {
            user.setCpf(dto.getCpf());
        }
        if (dto.getGender() != null) {
            user.setGender(dto.getGender());
        }
        if (dto.getBirthDate() != null) {
            user.setBirthDate(dto.getBirthDate());
        }

        // Atualizar senha apenas se foi fornecida
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não coincidem.");
            }
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        if (!isSameUser && dto.getRole() != null) {
            user.setRole(dto.getRole());
        }

        // Endereço de entrega
        if (dto.getAddressStreet() != null) {
            user.setAddressStreet(dto.getAddressStreet());
        }
        if (dto.getAddressNumber() != null) {
            user.setAddressNumber(dto.getAddressNumber());
        }
        if (dto.getAddressComplement() != null) {
            user.setAddressComplement(dto.getAddressComplement());
        }
        if (dto.getAddressNeighborhood() != null) {
            user.setAddressNeighborhood(dto.getAddressNeighborhood());
        }
        if (dto.getAddressCity() != null) {
            user.setAddressCity(dto.getAddressCity());
        }
        if (dto.getAddressState() != null) {
            user.setAddressState(dto.getAddressState());
        }
        if (dto.getAddressZipcode() != null) {
            user.setAddressZipcode(dto.getAddressZipcode());
        }

        // Informações de pagamento
        if (dto.getCardHolderName() != null) {
            user.setCardHolderName(dto.getCardHolderName());
        }
        if (dto.getCardLastDigits() != null) {
            user.setCardLastDigits(dto.getCardLastDigits());
        }
        if (dto.getCardBrand() != null) {
            user.setCardBrand(dto.getCardBrand());
        }
        if (dto.getCardExpiration() != null) {
            user.setCardExpiration(dto.getCardExpiration());
        }

        // Contato adicional
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }

        userRepository.save(user);
    }

    public User enableDisable(Long id, boolean active) {
        User user = userRepository.getById(id);
        user.setActive(active);
        userRepository.save(user);
        return user;
    }
}
