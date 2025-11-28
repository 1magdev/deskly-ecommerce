package com.app.deskly.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbl_users_cart")
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cpf", nullable = false, unique = true, length = 14)
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Long user;

    @ManyToOne
    @JoinColumn(name = "product_id",  referencedColumnName = "id", nullable = false)
    private Long product;

    @Column(name="quantity")
    private Integer quantity;
}
