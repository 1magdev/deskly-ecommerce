package com.app.deskly.controller;

import com.app.deskly.dto.address.AddressRequestDTO;
import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.model.user.User;
import com.app.deskly.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@PreAuthorize("isAuthenticated()") 
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> list(
            @AuthenticationPrincipal User user
    ) {
        List<AddressResponseDTO> addresses = addressService.listAddresses(user);
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<AddressResponseDTO> create(
            @AuthenticationPrincipal User user,
            @RequestBody AddressRequestDTO body
    ) {
        AddressResponseDTO created = addressService.createAddress(user, body);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody AddressRequestDTO body
    ) {
        AddressResponseDTO updated = addressService.updateAddress(user, id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        addressService.deleteAddress(user, id);
        return ResponseEntity.noContent().build();
    }
}
