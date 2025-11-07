package com.app.deskly.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.deskly.model.User;
import com.app.deskly.service.CartService;


import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/cart")
@PreAuthorize("isAuthenticated()")
public class CartController {

    @Autowired private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addProductToCart(
        @RequestBody com.app.deskly.dto.cart.AddToCartRequestDTO request,
        @AuthenticationPrincipal User user, 
        HttpServletRequest httpRequest
    ) {
        String sessionId = httpRequest.getSession().getId(); 
        cartService.addProductToCart(sessionId, user, request.getProductId());
        return ResponseEntity.ok("Produto adicionado ao carrinho!");
    }


    @PutMapping("/increase/{productId}")
    public ResponseEntity<?> increaseItem(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        cartService.increaseItem(productId, sessionId, user);
        return ResponseEntity.ok("Quantidade aumentada com sucesso.");
    }

    @PutMapping("/decrease/{productId}")
    public ResponseEntity<?> decreaseItem(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        cartService.decreaseItem(productId, sessionId, user);
        return ResponseEntity.ok("Quantidade diminuída com sucesso.");
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeItem(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        cartService.removeItem(productId, sessionId, user);
        return ResponseEntity.ok("Item removido do carrinho com sucesso.");
    }

}

