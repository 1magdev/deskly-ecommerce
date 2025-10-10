package com.app.deskly.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductUpdateDTO {
    @NotNull
    @Min(0)
    private Integer quantity;
}
