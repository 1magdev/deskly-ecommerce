package com.app.deskly.service;

import com.app.deskly.dto.product.ProductResponseDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.Stock;
import com.app.deskly.repository.ProductRepository;
import com.app.deskly.repository.StockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Stock stock;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Monitor LG 24\"");
        product.setPrice(new BigDecimal("899.90"));
        product.setActive(true);
        product.setDescription("Monitor LED 24 polegadas");
        product.setRating(4.5);
        product.setCategory(com.app.deskly.model.ProductCategories.Monitor);

        stock = new Stock();
        stock.setId(1L);
        stock.setProduct(product);
        stock.setQuantity(10);
    }

    @Test
    void shouldCreateProductWithStock() {
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(stockRepository.findByProductId(1L)).thenReturn(Optional.empty());
        when(stockRepository.save(any(Stock.class))).thenReturn(stock);

        Product result = productService.create(product, 10);

        assertNotNull(result);
        verify(productRepository).save(product);
        verify(stockRepository).save(any(Stock.class));
    }

    @Test
    void shouldGetProductById() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getById(1L);

        assertNotNull(result);
        assertEquals("Monitor LG 24\"", result.getName());
    }

    @Test
    void shouldThrowExceptionWhenProductNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> productService.getById(999L));
    }

    @Test
    void shouldListOnlyActiveProductsInCatalog() {
        when(productRepository.findByActive(true)).thenReturn(List.of(product));
        when(stockRepository.findByProductId(1L)).thenReturn(Optional.of(stock));

        List<ProductResponseDTO> result = productService.listCatalogProducts(null, null, 0, 10);

        assertEquals(1, result.size());
        assertEquals("Monitor LG 24\"", result.get(0).getName());
        assertEquals(10, result.get(0).getQuantity());
    }

    @Test
    void shouldUpdateProductAndStock() {
        Product updatedData = new Product();
        updatedData.setName("Monitor LG 27\"");
        updatedData.setPrice(new BigDecimal("1299.90"));
        updatedData.setCategory(com.app.deskly.model.ProductCategories.Monitor);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(stockRepository.findByProductId(1L)).thenReturn(Optional.of(stock));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product result = productService.update(1L, updatedData, 15);

        assertNotNull(result);
        verify(stockRepository).save(any(Stock.class));
    }

    @Test
    void shouldToggleProductStatus() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.enableDisable(1L, false);

        assertFalse(product.getActive());
        verify(productRepository).save(product);
    }

    @Test
    void shouldDeleteProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.delete(1L);

        verify(productRepository).delete(product);
    }
}
