package com.app.deskly.dto.cart;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.app.deskly.model.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

//configurar banco ainda.....!!!!
@Data
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId; 
    @ManyToOne
    private User user; 

    private BigDecimal shippingCost;

    private BigDecimal subtotal;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();
}

