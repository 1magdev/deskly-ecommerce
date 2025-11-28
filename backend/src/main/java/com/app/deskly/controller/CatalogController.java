package com.app.deskly.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.deskly.dto.product.ProductResponseDTO;
import com.app.deskly.service.ProductService;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public List<ProductResponseDTO> listProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.listCatalogProducts(search, category, page, size);
    }

    @GetMapping("/products/{id}")
    public ProductResponseDTO getProduct(@PathVariable Long id) {
        return productService.getForCatalogById(id);
    }
}
