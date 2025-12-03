package com.app.deskly.dto.order;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequestDTO {
    private BigDecimal shippingValue;
    private Long addressId;
    private List<OrderItemRequestDTO> items;
}
