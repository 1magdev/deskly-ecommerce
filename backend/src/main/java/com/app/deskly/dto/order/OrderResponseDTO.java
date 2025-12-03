package com.app.deskly.dto.order;

import com.app.deskly.dto.address.AddressResponseDTO;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private BigDecimal totalValue;
    private BigDecimal shippingValue;
    private AddressResponseDTO address;
    private List<OrderItemResponseDTO> items;
    private LocalDateTime createdAt;
}
