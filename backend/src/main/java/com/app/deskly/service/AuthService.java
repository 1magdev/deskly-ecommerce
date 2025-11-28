package com.app.deskly.service;

import com.app.deskly.dto.auth.AuthResponseDTO;
import com.app.deskly.dto.user.UserRequestDTO;
import com.app.deskly.model.UserRoles;
import com.app.deskly.model.user.AuthenticatedUser;
import com.app.deskly.model.user.Customer;
import com.app.deskly.model.user.User;
import com.app.deskly.repository.CustomerRepository;
import com.app.deskly.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private CustomerService customerService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();;

    @Value("${env.jwt.expiration}")
    private long jwtExpiration;
    @Value("${env.jwt.secret}")
    private String jwtSecret;
    private SecretKey jwtSecretKey;

    @PostConstruct
    public void init() {
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String login(String email, String password) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            if (!customer.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
            }
            if (!passwordEncoder.matches(password, customer.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
            }
            return generateTokenCustomer(customer);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
            }
            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
            }
            return generateToken(user);
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credênciais inválidas!");
    }

    public AuthResponseDTO register(UserRequestDTO userData){
       if (userData.getRole() != UserRoles.CUSTOMER) {
            throw new IllegalArgumentException("Não é possível se registrar como ADMIN ou ESTOQUISTA");
        }

        Customer customer = customerService.create(userData);
        String token = this.generateTokenCustomer(customer);

        AuthResponseDTO response = new AuthResponseDTO(token, customer.getEmail(), UserRoles.CUSTOMER.name());

        return response;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(this.jwtExpiration, ChronoUnit.SECONDS);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(jwtSecretKey)
                .compact();
    }

    public String generateTokenCustomer(Customer customer) {
        Instant now = Instant.now();
        Instant expiration = now.plus(this.jwtExpiration, ChronoUnit.SECONDS);

        return Jwts.builder()
                .subject(customer.getId().toString())
                .claim("email", customer.getEmail())
                .claim("role", UserRoles.CUSTOMER.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(jwtSecretKey)
                .compact();
    }

    public Claims validateToken(String token) {

        return Jwts.parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Optional<AuthenticatedUser> getUserFromToken(String token) {
        try {
            Claims claims = validateToken(token);
            Long userId = Long.valueOf(claims.getSubject());
            String role = claims.get("role", String.class);

            if (UserRoles.CUSTOMER.name().equals(role)) {
                return customerRepository.findById(userId).map(c -> (AuthenticatedUser) c);
            }
            return userRepository.findById(userId).map(u -> (AuthenticatedUser) u);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Long getUserIdFromToken(String token) {
            Claims claims = validateToken(token);
            return Long.valueOf(claims.getSubject());
    }
}
