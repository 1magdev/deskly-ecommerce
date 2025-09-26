package com.app.deskly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductResponseDTO {
    private Long id;
    private String code;
    private String name;
    private Integer quantity;
    private Double price;
    private String status;
}
