package com.app.deskly.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.app.deskly.dto.product.ProductCreateDTO;
import com.app.deskly.dto.product.ProductDTO;
import com.app.deskly.dto.product.ProductUpdateDTO;
import com.app.deskly.model.Product;
import com.app.deskly.service.ProductService;
import com.app.deskly.repository.StockRepository;

@RestController
@RequestMapping("/products")
@PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
public class ProductController {

  @Autowired
  private ProductService productService;

  @Autowired
  private StockRepository stockRepository;

  @PostMapping
  public ResponseEntity<Void> createProduct(@RequestBody ProductCreateDTO dto) {
    Product product = productService.getCreatedProduct(dto);
    productService.create(product);
    return ResponseEntity.ok().build();
  }

  @GetMapping
  public Page<ProductDTO> listProducts(
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return productService.listProducts(search, page, size)
        .map(this::toDTO);
  }

  @GetMapping("/{id}")
  public ProductDTO getProduct(@PathVariable Long id) {
    return toDTO(productService.getById(id));
  }

  @PutMapping("/{id}")
  public ProductDTO updateProduct(@PathVariable Long id, @RequestBody ProductCreateDTO dto) {
    Product product = productService.getUpdatedProduct(id, dto);
    return toDTO(productService.update(id, product, dto.getQuantity()));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<Void> toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
    productService.enableDisable(id, active);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
  }

  private ProductDTO toDTO(Product product) {
    ProductDTO dto = new ProductDTO();
    dto.setId(product.getId());
    dto.setName(product.getName());
    dto.setDescription(product.getDescription());
    dto.setCategory(product.getCategory());
    dto.setRating(product.getRating());
    dto.setPrice(product.getPrice());
    dto.setActive(product.getActive());
    dto.setProductImage(product.getProductImage());

    // Buscar quantidade do estoque
    Integer quantity = stockRepository.findByProductId(product.getId())
        .map(stock -> stock.getQuantity())
        .orElse(0);
    dto.setQuantity(quantity);

    return dto;
  }
}
