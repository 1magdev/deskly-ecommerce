package com.app.deskly.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.app.deskly.dto.cart.CartDTO;
import com.app.deskly.dto.cart.PaymentRequestDTO;
import com.app.deskly.dto.cart.SelectDeliveryAddressRequestDTO;
import com.app.deskly.dto.cart.SelectShippingRequestDTO;
import com.app.deskly.dto.cart.ShippingOptionDTO;
import com.app.deskly.model.Address;
import com.app.deskly.model.user.User;
import com.app.deskly.service.CheckoutService;

@RestController
@RequestMapping("/checkout")
@PreAuthorize("isAuthenticated()")
public class CheckoutController {
/*
    @Autowired
    private CheckoutService checkoutService;

    *//**
     * Inicia o processo de checkout
     *//*
    @PostMapping("/start")
    public ResponseEntity<CartDTO> startCheckout(@AuthenticationPrincipal User user) {
        CartDTO cart = checkoutService.startCheckout(user);
        return ResponseEntity.ok(cart);
    }

    *//**
     * Lista endereços disponíveis para entrega
     *//*
    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getDeliveryAddresses(
            @AuthenticationPrincipal User user) {

        List<Address> addresses = checkoutService.getDeliveryAddresses(user);
        return ResponseEntity.ok(addresses);
    }

    *//**
     * Seleciona endereço de entrega
     *//*
    @PostMapping("/address")
    public ResponseEntity<CartDTO> selectDeliveryAddress(
            @AuthenticationPrincipal User user,
            @RequestBody SelectDeliveryAddressRequestDTO request) {

        CartDTO cart = checkoutService.selectDeliveryAddress(user, request.getAddressId());
        return ResponseEntity.ok(cart);
    }

    *//**
     * Valida se endereço de entrega foi selecionado
     *//*
    @PostMapping("/address/validate")
    public ResponseEntity<String> validateDeliveryAddress(
            @AuthenticationPrincipal User user) {

        checkoutService.validateDeliveryAddress(user);
        return ResponseEntity.ok("Endereço de entrega validado");
    }

    *//**
     * Lista opções de frete disponíveis
     *//*
    @GetMapping("/shipping-options")
    public ResponseEntity<List<ShippingOptionDTO>> getShippingOptions() {
        List<ShippingOptionDTO> options = checkoutService.getShippingOptions();
        return ResponseEntity.ok(options);
    }

    *//**
     * Seleciona tipo de frete
     *//*
    @PostMapping("/shipping")
    public ResponseEntity<CartDTO> selectShipping(
            @AuthenticationPrincipal User user,
            @RequestBody SelectShippingRequestDTO request) {

        CartDTO cart = checkoutService.selectShipping(user, request);
        return ResponseEntity.ok(cart);
    }

    *//**
     * Valida se frete foi selecionado
     *//*
    @PostMapping("/shipping/validate")
    public ResponseEntity<String> validateShipping(
            @AuthenticationPrincipal User user) {

        checkoutService.validateShipping(user);
        return ResponseEntity.ok("Tipo de frete validado");
    }

    *//**
     * Lista métodos de pagamento disponíveis
     *//*
    @GetMapping("/payment-methods")
    public ResponseEntity<String[]> getPaymentMethods() {
        String[] methods = checkoutService.getPaymentMethods();
        return ResponseEntity.ok(methods);
    }

    *//**
     * Seleciona método de pagamento
     *//*
    @PostMapping("/payment")
    public ResponseEntity<CartDTO> selectPayment(
            @AuthenticationPrincipal User user,
            @RequestBody PaymentRequestDTO request) {

        CartDTO cart = checkoutService.selectPayment(user, request);
        return ResponseEntity.ok(cart);
    }

    *//**
     * Valida se método de pagamento foi selecionado
     *//*
    @PostMapping("/payment/validate")
    public ResponseEntity<String> validatePayment(
            @AuthenticationPrincipal User user) {

        checkoutService.validatePayment(user);
        return ResponseEntity.ok("Método de pagamento validado");
    }

    *//**
     * Finaliza o checkout
     *//*
    @PostMapping("/finalize")
    public ResponseEntity<CartDTO> finalizeCheckout(
            @AuthenticationPrincipal User user) {

        CartDTO cart = checkoutService.finalizeCheckout(user);
        return ResponseEntity.ok(cart);
    }*/
}
