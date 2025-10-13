package com.app.deskly.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.dto.cart.Cart;
import com.app.deskly.model.User;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    Optional<Cart> findBySessionId(String sessionId);
}

