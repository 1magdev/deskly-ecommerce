package com.app.deskly.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tbl_products")
public class Product {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Column(name = "product_image")
    private String productImage;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "rating", precision = 2)
    private Double rating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategories category;


    @Column(name = "description", length = 2000)
    private String description;

    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

}
