package com.app.deskly.dto.product;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Nome do produto não pode ser vazio")
    private String name;

    private String description;

    private Double rating;

    @NotBlank(message = "Quantidade não pode ser vazio")
    private Integer quantity;

    @NotNull(message = "Preço não pode ser vazio")
    private BigDecimal price;

    private Boolean active;

    private String productImage;

    private Integer mainImageIndex;

}
