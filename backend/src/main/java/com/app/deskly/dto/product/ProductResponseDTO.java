package com.app.deskly.dto.product;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductResponseDTO {
    private Long id;
    private String name;
    private Integer quantity;
    private BigDecimal price;
    private Boolean status;
    private String description;
    private Double rating;
    private String productImage;
    private List<String> images;
}
