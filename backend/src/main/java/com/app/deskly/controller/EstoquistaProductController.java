package com.app.deskly.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.deskly.dto.ProductListDTO;
import com.app.deskly.dto.ProductQuantityUpdateDTO;
import com.app.deskly.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/estoquista/products")
public class EstoquistaProductController {

    private final ProductService service;

    public EstoquistaProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ESTOQUISTA')")
    public ResponseEntity<Page<ProductListDTO>> list(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductListDTO> result = service.list(search, pr);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ESTOQUISTA')")
    public ResponseEntity<ProductListDTO> get(@PathVariable Long id) {
        ProductListDTO dto = service.getById(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/quantity")
    @PreAuthorize("hasRole('ESTOQUISTA')")
    public ResponseEntity<ProductListDTO> updateQuantity(@PathVariable Long id,
                                                         @Valid @RequestBody ProductQuantityUpdateDTO updateDTO) {
        ProductListDTO updated = service.updateQuantity(id, updateDTO);
        return ResponseEntity.ok(updated);
    }
}

