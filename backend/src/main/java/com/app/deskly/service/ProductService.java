package com.app.deskly.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.app.deskly.dto.product.ProductCreateDTO;
import com.app.deskly.dto.product.ProductResponseDTO;
import com.app.deskly.model.product.Product;
import com.app.deskly.model.product.ProductImage;
import com.app.deskly.model.Stock;
import com.app.deskly.repository.ProductImageRepository;
import com.app.deskly.repository.ProductRepository;
import com.app.deskly.repository.StockRepository;

@Service
public class ProductService {

  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private ProductImageRepository productImageRepository;

  @Autowired
  private StockRepository stockRepository;

  // *** Catalog ***

  public List<ProductResponseDTO> listCatalogProducts(String search, String category, int page, int size) {
    List<Product> products = productRepository.findByActive(true);

    return products.stream()
        .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
        .map(product -> {
          Stock stock = stockRepository.findByProductId(product.getId()).orElse(null);
          Integer quantity = stock != null ? stock.getQuantity() : 0;

          List<ProductImage> productImages = productImageRepository.findByProductOrderByMainDesc(product);
          List<String> images = productImages.stream().map(ProductImage::getImageBase64).toList();

          return new ProductResponseDTO(
              product.getId(),
              product.getName(),
              quantity,
              product.getPrice(),
              product.getActive(),
              product.getDescription(),
              product.getRating(),
              product.getProductImage(),
              images);
        }).toList();
  }

  public ProductResponseDTO getForCatalogById(Long id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

    Stock productOnStock = stockRepository.findByProductId(product.getId()).orElse(null);
    Integer quantity = productOnStock != null ? productOnStock.getQuantity() : 0;

    List<ProductImage> productImages = productImageRepository.findByProductOrderByMainDesc(product);
    List<String> images = productImages.stream().map(ProductImage::getImageBase64).toList();

    return new ProductResponseDTO(
        product.getId(),
        product.getName(),
        quantity,
        product.getPrice(),
        product.getActive(),
        product.getDescription(),
        product.getRating(),
        product.getProductImage(),
        images);
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

  public Product create(Product product, Integer quantity, List<String> images) {
      Product createdProduct = productRepository.save(product);

      if (images != null && !images.isEmpty()) {
          for (int i = 0; i < images.size(); i++) {
              ProductImage productImage = new ProductImage();
              productImage.setProduct(createdProduct);
              productImage.setImageBase64(images.get(i));
              productImage.setMain(i == 0);
              productImageRepository.save(productImage);
          }
      }

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

  public Product update(Long id, Product updatedProduct, Integer quantity, List<String> images) {
    Product existing = getById(id);

    System.out.println("Categoria: " + updatedProduct.getCategory().toString());

    existing.setName(updatedProduct.getName());
    existing.setPrice(updatedProduct.getPrice());
    existing.setCategory(updatedProduct.getCategory());
    existing.setDescription(updatedProduct.getDescription());
    existing.setRating(updatedProduct.getRating());

    if (updatedProduct.getProductImage() != null) {
      existing.setProductImage(updatedProduct.getProductImage());
    }

    // Atualizar imagens do produto
    if (images != null && !images.isEmpty()) {
      // Remover imagens antigas
      List<ProductImage> existingImages = productImageRepository.findByProductOrderByMainDesc(existing);
      productImageRepository.deleteAll(existingImages);

      // Adicionar novas imagens
      for (int i = 0; i < images.size(); i++) {
        ProductImage productImage = new ProductImage();
        productImage.setProduct(existing);
        productImage.setImageBase64(images.get(i));
        productImage.setMain(i == 0); // Primeira imagem é principal
        productImageRepository.save(productImage);
      }
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

    return product;
  }

}
