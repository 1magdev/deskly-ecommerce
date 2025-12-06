package com.app.deskly.dto.order;

import com.app.deskly.model.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequestDTO {
    private BigDecimal shippingValue;
    private Long addressId;
    private List<OrderItemRequestDTO> items;
    private PaymentMethod paymentMethod;
    private String cardHolderName;
    private String cardNumber;
    private String cardExpiryMonth;
    private String cardExpiryYear;
    private String cardCvv;
}
