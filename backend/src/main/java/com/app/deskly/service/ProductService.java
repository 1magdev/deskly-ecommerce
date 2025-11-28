package com.app.deskly.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.app.deskly.dto.product.ProductCreateDTO;
import com.app.deskly.dto.product.ProductResponseDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.Stock;
import com.app.deskly.repository.ProductRepository;
import com.app.deskly.repository.StockRepository;

@Service
public class ProductService {

  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private StockRepository stockRepository;

  // *** Catalog ***

  public List<ProductResponseDTO> listCatalogProducts(String search, String category, int page, int size) {
    List<Product> products = productRepository.findByActive(true);

    return products.stream().map(product -> {
      Stock stock = stockRepository.findByProductId(product.getId()).orElse(null);
      Integer quantity = stock != null ? stock.getQuantity() : 0;

      return new ProductResponseDTO(
          product.getId(),
          product.getName(),
          quantity,
          product.getPrice(),
          product.getActive(),
          product.getDescription(),
          product.getRating(),
          product.getProductImage());
    }).toList();
  }

  public ProductResponseDTO getForCatalogById(Long id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

    Stock productOnStock = stockRepository.findByProductId(product.getId()).orElse(null);
    Integer quantity = productOnStock != null ? productOnStock.getQuantity() : 0;

    return new ProductResponseDTO(
        product.getId(),
        product.getName(),
        quantity,
        product.getPrice(),
        product.getActive(),
        product.getDescription(),
        product.getRating(),
        product.getProductImage());
  }

  // *** Back-office ***

  public Page<Product> listProducts(String search, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    if (search == null || search.isEmpty()) {
      return productRepository.findAll(pageable);
    } else {
      return productRepository.findByNameContainingIgnoreCase(search, pageable);
    }
  }

  public Product getById(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
  }

  public Product create(Product product, Integer quantity) {
      Product createdProduct = productRepository.save(product);
      if (quantity != null && quantity >= 0) {
          Stock stock = stockRepository.findByProductId(createdProduct.getId())
                  .orElseGet(() -> {
                      Stock newStock = new Stock();
                      newStock.setProduct(createdProduct);
                      newStock.setIdCatalog(createdProduct.getId());
                      return newStock;
                  });
          stock.setQuantity(quantity);
          stockRepository.save(stock);
      }

      return createdProduct;
  }

  public Product update(Long id, Product updatedProduct, Integer quantity) {
    Product existing = getById(id);

    System.out.println("Categoria: " + updatedProduct.getCategory().toString());

    existing.setName(updatedProduct.getName());
    existing.setPrice(updatedProduct.getPrice());
    existing.setCategory(updatedProduct.getCategory());

    if (updatedProduct.getProductImage() != null) {
      existing.setProductImage(updatedProduct.getProductImage());
    }

    if (quantity != null && quantity >= 0) {
      Stock stock = stockRepository.findByProductId(existing.getId())
          .orElseGet(() -> {
            Stock newStock = new Stock();
            newStock.setProduct(existing);
            newStock.setIdCatalog(existing.getId());
            return newStock;
          });
      stock.setQuantity(quantity);
      stockRepository.save(stock);
    }
    return productRepository.save(existing);
  }

  public void enableDisable(Long id, boolean active) {
    Product product = getById(id);
    product.setActive(active);
    productRepository.save(product);
  }

  public void delete(Long id) {
    Product product = getById(id);
    productRepository.delete(product);
  }

  public Product getCreatedProduct(ProductCreateDTO dto) {

    Product product = new Product();

    product.setName(dto.getName());
    product.setDescription(dto.getDescription());
    product.setRating(dto.getRating());
    product.setPrice(dto.getPrice());
    product.setCategory(dto.getCategory());
    product.setActive(true);

    if (dto.getImage() != null) {
      product.setProductImage(dto.getImage());
    }

    return product;

  }

  public Product getUpdatedProduct(Long id, ProductCreateDTO dto) {
    Product product = getById(id);

    product.setName(dto.getName());
    product.setDescription(dto.getDescription());
    product.setPrice(dto.getPrice());
    product.setCategory(dto.getCategory());

    if (dto.getRating() != null) {
      product.setRating(dto.getRating());
    }

    if (dto.getImage() != null) {
      product.setProductImage(dto.getImage());
    }

    return product;
  }

}
