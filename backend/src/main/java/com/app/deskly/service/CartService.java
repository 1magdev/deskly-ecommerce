package com.app.deskly.service;

import com.app.deskly.model.Cart;
import com.app.deskly.model.Product;
import com.app.deskly.repository.CartRepository;
import com.app.deskly.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private ProductRepository productRepository;

    /**
     * Adiciona um produto ao carrinho do usuário autenticado
     */
    public Cart addProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        Cart cart;
        cart = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(Cart::new);

        if(cart.getQuantity() >= 1){
            int newQuantity = cart.getQuantity() + 1;
            cart.setQuantity(newQuantity);
        } else {
            cart.setProductId(productId);
            cart.setQuantity(1);
            cart.setUserId(userId);
        }

        Cart savedCart = cartRepository.save(cart);
        return savedCart;
    }


    public Cart decreaseProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        Cart cart;
        cart = cartRepository.findByUserIdAndProductId(userId, productId)
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
        cart = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(Cart::new);
        cartRepository.delete(cart);

        return cartRepository.save(cart);
    }

    public List<Cart> getByUser(Long userId){
        cartRepository.findAll();
        return cartRepository.findAllByUserId(userId);
    }
}
