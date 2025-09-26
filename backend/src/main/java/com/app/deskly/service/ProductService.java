package com.app.deskly.service;

import com.app.deskly.dto.ProductResponseDTO;
import com.app.deskly.dto.ProductUpdateDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.Stock;
import com.app.deskly.repository.ProductRepository;
import com.app.deskly.repository.StockRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public ProductService(ProductRepository productRepository, StockRepository stockRepository) {
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
    }

    public Page<ProductResponseDTO> list(String search, Pageable pageable) {
        Page<Product> page;
        if (search == null || search.isBlank()) {
            page = productRepository.findAll(pageable);
        } else {
            page = productRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        }

        return page.map(p -> {
            Optional<Stock> sOpt = stockRepository.findByProductId(p.getId());
            int qty = sOpt.map(Stock::getQuantity).orElse(0);
            String status = qty > 0 ? "ATIVO" : "DESATIVADO";
            String code = p.getId() == null ? "" : p.getId().toString();
            return new ProductResponseDTO(p.getId(), code, p.getName(), qty, p.getPrice(), status);
        });
    }

    public ProductResponseDTO getById(Long id) {
        Product p = productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        int qty = stockRepository.findByProductId(p.getId()).map(Stock::getQuantity).orElse(0);
        String status = qty > 0 ? "ATIVO" : "DESATIVADO";
        String code = p.getId() == null ? "" : p.getId().toString();
        return new ProductResponseDTO(p.getId(), code, p.getName(), qty, p.getPrice(), status);
    }

    @Transactional
    public ProductResponseDTO updateQuantity(Long productId, ProductUpdateDTO dto) {
        if (dto.getQuantity() == null || dto.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantidade inválida");
        }

        Product product = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        Stock stock = stockRepository.findByProductId(productId).orElseGet(() -> {
            Stock s = new Stock();
            s.setProduct(product);
            s.setQuantity(0);
            return s;
        });

        stock.setQuantity(dto.getQuantity());
        stock.setUpdatedAt(java.time.LocalDateTime.now());
        stockRepository.save(stock);

        String status = stock.getQuantity() > 0 ? "ATIVO" : "DESATIVADO";
        String code = product.getId() == null ? "" : product.getId().toString();
        return new ProductResponseDTO(product.getId(), code, product.getName(), stock.getQuantity(), product.getPrice(), status);
    }
}
