package com.app.deskly.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.dto.cart.CartDTO;
import com.app.deskly.dto.cart.CartItemDTO;

public interface CartItemRepository extends JpaRepository<CartItemDTO, Long> {
    List<CartItemDTO> findByCart(CartDTO cart);
}

