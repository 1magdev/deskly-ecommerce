package com.app.deskly.service;

import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.deskly.dto.ProductListDTO;
import com.app.deskly.dto.ProductQuantityUpdateDTO;
import com.app.deskly.model.Product;
import com.app.deskly.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public Page<ProductListDTO> list(String search, Pageable pageable) {
        Page<Product> page;
        if (search == null || search.isBlank()) {
            page = repository.findAll(pageable);
        } else {
            page = repository.findByNameContainingIgnoreCase(search.trim(), pageable);
        }
        return new PageImpl<>(
                page.getContent().stream().map(this::toListDto).collect(Collectors.toList()),
                pageable,
                page.getTotalElements()
        );
    }

    public ProductListDTO getById(Long id) {
        return repository.findById(id).map(this::toListDto).orElse(null);
    }

    @Transactional
    public ProductListDTO updateQuantity(Long id, ProductQuantityUpdateDTO dto) {
        Product p = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        p.setStock(dto.getStock());
        repository.save(p);
        return toListDto(p);
    }

    private ProductListDTO toListDto(Product p) {
        ProductListDTO dto = new ProductListDTO();
        dto.setId(p.getId());
        dto.setCode(p.getCode());
        dto.setName(p.getName());
        dto.setStock(p.getStock());
        dto.setPrice(p.getPrice());
        dto.setActive(p.getActive());
        return dto;
    }
}
