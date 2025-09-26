package com.app.deskly.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.app.deskly.dto.ProductCreateDTO;
import com.app.deskly.dto.ProductDTO;
import com.app.deskly.model.Product;
import com.app.deskly.service.ProductService;

@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasRole('ADMIN')")
public class ProductController {

    @Autowired
    private ProductService productService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(
        @RequestPart("data") ProductCreateDTO dto,
        @RequestPart("images") List<MultipartFile> images
    ) {
        productService.createProduct(dto, images);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public Page<ProductDTO> listProducts(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return productService.listProducts(search, page, size)
                .map(this::toDTO);
    }

    @GetMapping("/{id}")
    public ProductDTO getProduct(@PathVariable Long id) {
        return toDTO(productService.getById(id));
    }

    @PutMapping("/{id}")
    public ProductDTO updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return toDTO(productService.update(id, product));
    }

    @PatchMapping("/{id}/status")
    public void toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
        productService.enableDisable(id, active);
    }

    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setQuantity(product.getQuantity());
        dto.setPrice(product.getPrice());
        dto.setActive(product.getActive());
        return dto;
    }
}

