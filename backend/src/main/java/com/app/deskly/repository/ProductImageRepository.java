package com.app.deskly.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.app.deskly.model.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {}