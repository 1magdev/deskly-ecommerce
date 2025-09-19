package com.app.deskly.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductQuantityUpdateDTO {
    @NotNull
    @Min(value = 0, message = "Quantidade deve ser 0 ou maior")
    private Integer stock;
}
