package com.app.deskly.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.dto.cart.CartDTO;
import com.app.deskly.model.User;

public interface CartRepository extends JpaRepository<CartDTO, Long> {
    Optional<CartDTO> findByUser(User user);
    Optional<CartDTO> findBySessionId(String sessionId);
}

