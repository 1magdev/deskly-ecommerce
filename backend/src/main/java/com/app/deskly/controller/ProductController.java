package com.app.deskly.controller;

import com.app.deskly.dto.ProductResponseDTO;
import com.app.deskly.dto.ProductUpdateDTO;
import com.app.deskly.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/estoquista/products")
@PreAuthorize("hasRole('ESTOQUISTA')")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> list(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductResponseDTO> result = productService.list(search, pr);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> get(@PathVariable Long id) {
        try {
            ProductResponseDTO dto = productService.getById(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<ProductResponseDTO> updateQuantity(@PathVariable Long id,
                                                             @Valid @RequestBody ProductUpdateDTO updateDTO) {
        try {
            ProductResponseDTO updated = productService.updateQuantity(id, updateDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
