package com.app.deskly.dto.cart;

import lombok.Data;

@Data
public class PaymentRequestDTO {

    private String method;

    private String cardNumber;         
    private String cardCvv;            
    private String cardHolderName;     
    private String cardExpiration;     
    private Integer installments;      
}
