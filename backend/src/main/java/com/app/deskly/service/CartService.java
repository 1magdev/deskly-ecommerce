package com.app.deskly.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.app.deskly.model.Cart;
import com.app.deskly.model.CartItem;
import com.app.deskly.model.Product;
import com.app.deskly.repository.CartItemRepository;
import com.app.deskly.repository.CartRepository;
import com.app.deskly.repository.ProductRepository;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;

    /**
     * Adiciona um produto ao carrinho do usuário autenticado
     */
    public Cart addProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        Cart cart;
        cart = cartRepository.findByUserAndProduct(userId, productId)
                .orElseGet(Cart::new);

        if(cart.getQuantity() >= 1){
            int newQuantity = cart.getQuantity() + 1;
            cart.setQuantity(newQuantity);
        } else {
            cart.setProduct(productId);
            cart.setQuantity(1);
            cart.setUser(userId);
        }

        Cart savedCart = cartRepository.save(cart);
        return savedCart;
    }


    public Cart decreaseProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        Cart cart;
        cart = cartRepository.findByUserAndProduct(userId, productId)
                .orElseGet(Cart::new);

        if(cart.getQuantity() <= 1){
            cartRepository.delete(cart);
        } else {
            cart.setQuantity(cart.getQuantity()-1);
        }

        Cart savedCart = cartRepository.save(cart);
        return savedCart;
    }

    public Cart deleteProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        Cart cart;
        cart = cartRepository.findByUserAndProduct(userId, productId)
                .orElseGet(Cart::new);
        cartRepository.delete(cart);

        return cartRepository.save(cart);
    }

    public List<Cart> getByUser(Long userId){
        cartRepository.findAll();
        return cartRepository.findAllByUser(userId);
    }
}
