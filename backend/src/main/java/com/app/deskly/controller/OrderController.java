package com.app.deskly.controller;

import com.app.deskly.dto.order.OrderRequestDTO;
import com.app.deskly.dto.order.OrderResponseDTO;
import com.app.deskly.model.user.Customer;
import com.app.deskly.service.OrderService;
import com.app.deskly.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@PreAuthorize("isAuthenticated()")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private AuthUtil authUtil;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(
            @RequestHeader("Authorization") String token,
            @RequestBody OrderRequestDTO body
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        OrderResponseDTO created = orderService.createOrder(customer, body);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> list(
            @RequestHeader("Authorization") String token
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        List<OrderResponseDTO> orders = orderService.listOrders(customer);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'BACKOFFICE')")
    public ResponseEntity<List<OrderResponseDTO>> listAll() {
        List<OrderResponseDTO> orders = orderService.listAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> get(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        OrderResponseDTO order = orderService.getOrder(customer, id);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'BACKOFFICE')")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        OrderResponseDTO order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}
