package com.app.deskly.dto.order;

import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.model.OrderStatus;
import com.app.deskly.model.PaymentMethod;
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
    private PaymentMethod paymentMethod;
    private String cardLastFourDigits;
    private AddressResponseDTO address;
    private List<OrderItemResponseDTO> items;
    private LocalDateTime createdAt;
}
