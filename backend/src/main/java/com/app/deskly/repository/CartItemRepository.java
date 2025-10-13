package com.app.deskly.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.dto.cart.Cart;
import com.app.deskly.dto.cart.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
}

