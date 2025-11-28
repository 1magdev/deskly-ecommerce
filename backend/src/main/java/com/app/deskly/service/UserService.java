package com.app.deskly.service;

import com.app.deskly.dto.user.UpdateUserDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.*;
import com.app.deskly.model.user.Customer;
import com.app.deskly.model.user.User;
import com.app.deskly.repository.AdminRepository;
import com.app.deskly.repository.BackofficeRepository;
import com.app.deskly.repository.CustomerRepository;
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

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BackofficeRepository backofficeRepository;

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

        User user = createUserByRole(dto.getRole());

        // Campos comuns
        user.setFullname(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setActive(true);
        user.setPhone(dto.getPhone());

        // Campos específicos de Customer
        if (user instanceof Customer) {
            Customer customer = (Customer) user;
            customer.setGender(dto.getGender());
            customer.setBirthDate(dto.getBirthDate());
            customer.setAddressStreet(dto.getAddressStreet());
            customer.setAddressNumber(dto.getAddressNumber());
            customer.setAddressComplement(dto.getAddressComplement());
            customer.setAddressNeighborhood(dto.getAddressNeighborhood());
            customer.setAddressCity(dto.getAddressCity());
            customer.setAddressState(dto.getAddressState());
            customer.setAddressZipcode(dto.getAddressZipcode());
            customer.setCardHolderName(dto.getCardHolderName());
            customer.setCardLastDigits(dto.getCardLastDigits());
            customer.setCardBrand(dto.getCardBrand());
            customer.setCardExpiration(dto.getCardExpiration());
            return customerRepository.save(customer);
        } else if (user instanceof Admin) {
            return adminRepository.save((Admin) user);
        } else if (user instanceof Backoffice) {
            return backofficeRepository.save((Backoffice) user);
        }

        return userRepository.save(user);
    }

    private User createUserByRole(UserRoles role) {
        switch (role) {
            case CUSTOMER:
                return new Customer();
            case ADMIN:
                return new Admin();
            case BACKOFFICE:
                return new Backoffice();
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role inválido");
        }
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

        // Contato adicional
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }

        // Campos específicos de Customer
        if (user instanceof Customer) {
            Customer customer = (Customer) user;

            if (dto.getGender() != null) {
                customer.setGender(dto.getGender());
            }
            if (dto.getBirthDate() != null) {
                customer.setBirthDate(dto.getBirthDate());
            }

            // Endereço de entrega
            if (dto.getAddressStreet() != null) {
                customer.setAddressStreet(dto.getAddressStreet());
            }
            if (dto.getAddressNumber() != null) {
                customer.setAddressNumber(dto.getAddressNumber());
            }
            if (dto.getAddressComplement() != null) {
                customer.setAddressComplement(dto.getAddressComplement());
            }
            if (dto.getAddressNeighborhood() != null) {
                customer.setAddressNeighborhood(dto.getAddressNeighborhood());
            }
            if (dto.getAddressCity() != null) {
                customer.setAddressCity(dto.getAddressCity());
            }
            if (dto.getAddressState() != null) {
                customer.setAddressState(dto.getAddressState());
            }
            if (dto.getAddressZipcode() != null) {
                customer.setAddressZipcode(dto.getAddressZipcode());
            }

            // Informações de pagamento
            if (dto.getCardHolderName() != null) {
                customer.setCardHolderName(dto.getCardHolderName());
            }
            if (dto.getCardLastDigits() != null) {
                customer.setCardLastDigits(dto.getCardLastDigits());
            }
            if (dto.getCardBrand() != null) {
                customer.setCardBrand(dto.getCardBrand());
            }
            if (dto.getCardExpiration() != null) {
                customer.setCardExpiration(dto.getCardExpiration());
            }
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
