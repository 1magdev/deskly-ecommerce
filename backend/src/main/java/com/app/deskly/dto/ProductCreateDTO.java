package com.app.deskly.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductCreateDTO {
    
    
    private Long id;

    @Size(max = 200)
    @NotBlank(message = "Nome do produto não pode ser vazio")
    private String name;

    @DecimalMin("0.5")
    @DecimalMax("5.0")
    @Digits(integer = 1, fraction = 1)
    private Double rating;

    @Size(max = 2000)
    @NotBlank(message = "Descrição do produto não pode ser vazio")
    private String description;

    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @NotNull
    private BigDecimal price;

    @Min(0)
    private Integer quantity;


    private Integer mainImageIndex; 

}
