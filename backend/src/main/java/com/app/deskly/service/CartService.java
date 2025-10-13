package com.app.deskly.service;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.deskly.dto.cart.Cart;
import com.app.deskly.dto.cart.CartItem;
import com.app.deskly.model.Product;
import com.app.deskly.model.User;
import com.app.deskly.repository.CartItemRepository;
import com.app.deskly.repository.CartRepository;
import com.app.deskly.repository.ProductRepository;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;

    public void addProductToCart(String sessionId, User user, Long productId) {
        Cart cart;

        if (user != null) {
            cart = cartRepository.findByUser(user).orElse(new Cart());
            cart.setUser(user);
        } else {
            cart = cartRepository.findBySessionId(sessionId).orElse(new Cart());
            cart.setSessionId(sessionId);
        }

        Product product = productRepository.findById(productId).orElseThrow();
        Optional<CartItem> existingItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + 1);
        } else {
            CartItem item = new CartItem();
            item.setProduct(product);
            item.setQuantity(1);
            item.setCart(cart);
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
    }


    public void increaseItem(Long productId, String sessionId, User user) {
        Cart cart = findCart(sessionId, user);
        CartItem item = findItem(cart, productId);

        item.setQuantity(item.getQuantity() + 1);
        cartItemRepository.save(item);

        recalculateSubtotal(cart);
        cartRepository.save(cart);
    }

    public void decreaseItem(Long productId, String sessionId, User user) {
        Cart cart = findCart(sessionId, user);
        CartItem item = findItem(cart, productId);

        if (item.getQuantity() > 1) {
            item.setQuantity(item.getQuantity() - 1);
            cartItemRepository.save(item);
        } else {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        }

        recalculateSubtotal(cart);
        cartRepository.save(cart);
    }

    public void removeItem(Long productId, String sessionId, User user) {
        Cart cart = findCart(sessionId, user);
        CartItem item = findItem(cart, productId);

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        recalculateSubtotal(cart);
        cartRepository.save(cart);
    }

    private void recalculateSubtotal(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
            .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal frete = cart.getShippingCost() != null ? cart.getShippingCost() : BigDecimal.ZERO;

        cart.setSubtotal(subtotal.add(frete)); 
    }

    private Cart findCart(String sessionId, User user) {
        return user != null ?
            cartRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Carrinho não encontrado para usuário")) :
            cartRepository.findBySessionId(sessionId).orElseThrow(() -> new RuntimeException("Carrinho não encontrado para sessão"));
    }

    private CartItem findItem(Cart cart, Long productId) {
        return cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Produto não encontrado no carrinho"));
    }

    


}

