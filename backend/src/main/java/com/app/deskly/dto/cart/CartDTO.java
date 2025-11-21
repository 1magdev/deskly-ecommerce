package com.app.deskly.dto.cart;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.app.deskly.model.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import com.app.deskly.model.Address;
import jakarta.persistence.JoinColumn;


@Entity
@Data
public class CartDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId; 
    
    @ManyToOne
    private User user; 

    @ManyToOne
    @JoinColumn(name = "delivery_address_id")
    private Address deliveryAddress;

    private BigDecimal shippingCost;

    private BigDecimal subtotal;

    private Boolean deliveryAddressSelected = false;

    private String paymentMethod;

    private Integer paymentInstallments;     
    private String paymentCardHolderName;    
    private String paymentCardLastDigits;    
    private String paymentCardBrand;         
    private String paymentCardExpiration;   

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItemDTO> items = new ArrayList<>();

}

