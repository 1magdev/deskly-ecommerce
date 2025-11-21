package com.app.deskly.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.app.deskly.model.Address;
import com.app.deskly.dto.cart.SelectDeliveryAddressRequestDTO;
import com.app.deskly.dto.cart.PaymentRequestDTO;
import com.app.deskly.model.User;
import com.app.deskly.service.CartService;
import com.app.deskly.dto.cart.CartDTO;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/cart")
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

    @GetMapping
    public ResponseEntity<CartDTO> getCart(
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        CartDTO cart = cartService.getCart(sessionId, user);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> checkout(
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        CartDTO cart = cartService.checkout(sessionId, user);
        return ResponseEntity.ok(cart);
    }

        @GetMapping("/checkout/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Address>> listDeliveryAddresses(
            @AuthenticationPrincipal User user
    ) {
        List<Address> addresses = cartService.getValidDeliveryAddresses(user);
        return ResponseEntity.ok(addresses);
    }

        @PostMapping("/checkout/address")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> selectDeliveryAddress(
            @RequestBody SelectDeliveryAddressRequestDTO body,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        CartDTO cart = cartService.selectDeliveryAddress(sessionId, user, body.getAddressId());
        return ResponseEntity.ok(cart);
    }

        @PostMapping("/checkout/payment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> proceedToPayment(
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        cartService.validateDeliveryAddressSelected(sessionId, user);
        return ResponseEntity.ok("Endereço de entrega selecionado. Pode prosseguir para a forma de pagamento.");
    }

        @GetMapping("/checkout/payment-methods")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String[]> getPaymentMethods() {
        String[] methods = {"BOLETO", "CARD"};
        return ResponseEntity.ok(methods);
    }

        @PostMapping("/checkout/payment/select")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> selectPayment(
            @RequestBody PaymentRequestDTO body,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        CartDTO cart = cartService.selectPayment(sessionId, user, body);
        return ResponseEntity.ok(cart);
    }

        @PostMapping("/checkout/payment/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> validatePayment(
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        String sessionId = request.getSession().getId();
        cartService.validatePaymentSelected(sessionId, user);
        return ResponseEntity.ok("Forma de pagamento selecionada e válida. Pode prosseguir para a validação final do pedido.");
    }

}

