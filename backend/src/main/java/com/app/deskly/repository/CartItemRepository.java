package com.app.deskly.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.model.Cart;
import com.app.deskly.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
}
