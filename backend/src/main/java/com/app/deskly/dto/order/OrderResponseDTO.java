package com.app.deskly.dto.order;

import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.model.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private BigDecimal totalValue;
    private BigDecimal shippingValue;
    private OrderStatus status;
    private AddressResponseDTO address;
    private List<OrderItemResponseDTO> items;
    private LocalDateTime createdAt;
}
