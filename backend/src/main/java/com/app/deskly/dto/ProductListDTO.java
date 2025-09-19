package com.app.deskly.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProductListDTO {
    private Long id;
    private String code;
    private String name;
    private Integer stock;
    private BigDecimal price;
    private Boolean active;
}
