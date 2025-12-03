package com.app.deskly.repository;

import com.app.deskly.model.product.Product;
import com.app.deskly.model.product.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductOrderByMainDesc(Product product);
    Optional<ProductImage> findByProductAndMainTrue(Product product);
}
