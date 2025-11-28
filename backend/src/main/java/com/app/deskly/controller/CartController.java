package com.app.deskly.controller;

import com.app.deskly.dto.cart.AddToCartRequestDTO;
import com.app.deskly.model.Cart;
import com.app.deskly.service.AuthService;
import com.app.deskly.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@PreAuthorize("isAuthenticated()")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthService authService;
    /**
     * Adiciona produto ao carrinho
     */
    @PostMapping("/add")
    public ResponseEntity<Cart> addProduct(
            @RequestHeader("Authorization") String token,
            @RequestBody AddToCartRequestDTO request) {
                Long userId = authService.getUserIdFromToken(token);
        Cart cart = cartService.addProduct(userId, request.getProductId());
        return ResponseEntity.ok(cart);
    }

    @GetMapping
    public ResponseEntity<List<Cart>> getUserCart(@RequestHeader("Authorization") String token) {
        Long userId = authService.getUserIdFromToken(token);
        List<Cart> cart = cartService.getByUser(userId);
        return ResponseEntity.ok(cart);
    }


    /**
     * Diminui quantidade de um item
     */
    @PutMapping("/decrease/{productId}")
    public ResponseEntity<Cart> decreaseItem(
            @RequestHeader("Authorization") String token,
            @PathVariable Long productId) {
        Long userId = authService.getUserIdFromToken(token);
        Cart cart = cartService.decreaseProduct(userId, productId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Remove item do carrinho
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Cart> removeItem(
            @RequestHeader("Authorization") String token,
            @PathVariable Long productId) {
        Long userId = authService.getUserIdFromToken(token);
        Cart cart = cartService.deleteProduct(userId, productId);
        return ResponseEntity.ok(cart);
    }

}
