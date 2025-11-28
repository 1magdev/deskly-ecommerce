package com.app.deskly.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.model.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserAndProduct(Long userId, Long productId);
    List<Cart> findAllByUser(Long userId);
}
