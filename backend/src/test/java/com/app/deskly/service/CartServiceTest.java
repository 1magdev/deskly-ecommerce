package com.app.deskly.service;

import com.app.deskly.dto.cart.CartDTO;
import com.app.deskly.dto.cart.CartItemDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.User;
import com.app.deskly.repository.CartItemRepository;
import com.app.deskly.repository.CartRepository;
import com.app.deskly.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private Product product;
    private User user;
    private CartDTO cart;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Mouse Gamer");
        product.setPrice(new BigDecimal("150.00"));

        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        cart = new CartDTO();
        cart.setId(1L);
        cart.setUser(user);
        cart.setItems(new ArrayList<>());
        cart.setShippingCost(new BigDecimal("20.00"));
    }

    @Test
    void shouldAddProductToNewCart() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());
        when(cartRepository.save(any(CartDTO.class))).thenReturn(cart);

        cartService.addProductToCart(null, user, 1L);

        verify(cartRepository).save(any(CartDTO.class));
    }

    @Test
    void shouldIncrementQuantityWhenProductAlreadyInCart() {
        CartItemDTO existingItem = new CartItemDTO();
        existingItem.setProduct(product);
        existingItem.setQuantity(1);
        existingItem.setCart(cart);
        cart.getItems().add(existingItem);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        cartService.addProductToCart(null, user, 1L);

        assertEquals(2, existingItem.getQuantity());
        verify(cartRepository).save(cart);
    }

    @Test
    void shouldCreateCartBySessionIdWhenUserIsNull() {
        String sessionId = "session123";
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.empty());

        cartService.addProductToCart(sessionId, null, 1L);

        verify(cartRepository).findBySessionId(sessionId);
        verify(cartRepository).save(any(CartDTO.class));
    }

    @Test
    void shouldIncreaseItemQuantity() {
        CartItemDTO item = new CartItemDTO();
        item.setProduct(product);
        item.setQuantity(1);
        item.setCart(cart);
        cart.getItems().add(item);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        cartService.increaseItem(1L, null, user);

        assertEquals(2, item.getQuantity());
        verify(cartItemRepository).save(item);
    }

    @Test
    void shouldDecreaseItemQuantity() {
        CartItemDTO item = new CartItemDTO();
        item.setProduct(product);
        item.setQuantity(3);
        item.setCart(cart);
        cart.getItems().add(item);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        cartService.decreaseItem(1L, null, user);

        assertEquals(2, item.getQuantity());
        verify(cartItemRepository).save(item);
    }

    @Test
    void shouldRemoveItemWhenQuantityIsOne() {
        CartItemDTO item = new CartItemDTO();
        item.setProduct(product);
        item.setQuantity(1);
        item.setCart(cart);
        cart.getItems().add(item);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        cartService.decreaseItem(1L, null, user);

        assertTrue(cart.getItems().isEmpty());
        verify(cartItemRepository).delete(item);
    }

    @Test
    void shouldRemoveItemFromCart() {
        CartItemDTO item = new CartItemDTO();
        item.setProduct(product);
        item.setQuantity(5);
        item.setCart(cart);
        cart.getItems().add(item);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        cartService.removeItem(1L, null, user);

        assertTrue(cart.getItems().isEmpty());
        verify(cartItemRepository).delete(item);
    }

    @Test
    void shouldThrowExceptionWhenCartNotFound() {
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> cartService.increaseItem(1L, null, user));
    }

    @Test
    void shouldThrowExceptionWhenProductNotInCart() {
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        assertThrows(RuntimeException.class, () -> cartService.removeItem(999L, null, user));
    }
}
