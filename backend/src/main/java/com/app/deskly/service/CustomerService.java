package com.app.deskly.service;

import com.app.deskly.dto.user.UpdateUserDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.UserRoles;
import com.app.deskly.model.user.Customer;
import com.app.deskly.repository.CustomerRepository;
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
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Customer create(UserRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "senhas não coincidem");
        }

        if (!CpfValidator.isValid(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido");
        }

        if (customerRepository.existsByCpf(dto.getCpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email já cadastrado");
        }

        Customer customer = new Customer();
        customer.setFullname(dto.getFullname());
        customer.setEmail(dto.getEmail());
        customer.setCpf(dto.getCpf());
        customer.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        customer.setActive(true);
        customer.setGender(dto.getGender());
        customer.setBirthDate(dto.getBirthDate());

        return customerRepository.save(customer);
    }

    public Customer getById(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }

    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    public void updateCustomer(Long id, UpdateUserDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedEmail = authentication.getName();
        Customer loggedCustomer = customerRepository.findByEmail(loggedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente logado não encontrado"));

        boolean isSameUser = customer.getId().equals(loggedCustomer.getId());

        if (dto.getFullname() != null) {
            customer.setFullname(dto.getFullname());
        }
        if (dto.getCpf() != null) {
            customer.setCpf(dto.getCpf());
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não coincidem.");
            }
            customer.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getGender() != null) {
            customer.setGender(dto.getGender());
        }
        if (dto.getBirthDate() != null) {
            customer.setBirthDate(dto.getBirthDate());
        }

        customerRepository.save(customer);
    }

    public Customer enableDisable(Long id, boolean active) {
        Customer customer = customerRepository.getReferenceById(id);
        customer.setActive(active);
        customerRepository.save(customer);
        return customer;
    }
}
