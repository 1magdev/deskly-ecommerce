package com.app.deskly.controller;

import com.app.deskly.dto.address.AddressRequestDTO;
import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.model.user.Customer;
import com.app.deskly.service.AddressService;
import com.app.deskly.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@PreAuthorize("isAuthenticated()")
public class AddressController {

    @Autowired
    private AddressService addressService;
    @Autowired
    private AuthUtil authUtil;

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> list(
            @RequestHeader("Authorization") String token
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        List<AddressResponseDTO> addresses = addressService.listAddresses(customer);
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<AddressResponseDTO> create(
            @RequestHeader("Authorization") String token,
            @RequestBody AddressRequestDTO body
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        AddressResponseDTO created = addressService.createAddress(customer, body);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> update(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody AddressRequestDTO body
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        AddressResponseDTO updated = addressService.updateAddress(customer, id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        Customer customer = authUtil.getCustomerFromToken(token);
        addressService.deleteAddress(customer, id);
        return ResponseEntity.noContent().build();
    }
}
