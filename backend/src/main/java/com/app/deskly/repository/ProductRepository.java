package com.app.deskly.repository;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import com.app.deskly.model.Product;

public interface ProductRepository  extends JpaRepository<Product, Long>{
    
    Page<Product> findByName(String name, Pageable pageable);
}

