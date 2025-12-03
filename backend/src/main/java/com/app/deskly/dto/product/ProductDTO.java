package com.app.deskly.dto.product;

import java.math.BigDecimal;

import com.app.deskly.model.product.ProductCategories;
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

    @NotNull(message = "A categoria do produto é obrigatória.")
    private ProductCategories category;

}
