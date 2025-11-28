package com.app.deskly.dto.cart;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShippingOptionDTO {
    private String type;        // 'default' ou 'express'
    private String name;        // Nome amigável
    private BigDecimal price;   // Preço fixo
    private String description; // Descrição
}
