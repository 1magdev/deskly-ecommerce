package com.app.deskly.dto.cart;

import lombok.Data;

@Data
public class SelectShippingRequestDTO {
    private String shippingType; // 'express' ou 'default'
}
