package com.app.deskly.util;

import com.app.deskly.model.user.Customer;
import com.app.deskly.model.user.User;
import com.app.deskly.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AuthUtil {

    private final AuthService authService;

    public AuthUtil(AuthService authService) {
        this.authService = authService;
    }

    public User getUserFromToken(String token) {
        return (User) authService.getUserFromToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));
    }

    public Customer getCustomerFromToken(String token) {
        return (Customer) authService.getUserFromToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente não encontrado."));
    }
}
