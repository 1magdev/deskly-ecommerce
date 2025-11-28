package com.app.deskly.model;

import com.app.deskly.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tbl_addresses")
@Data
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;

    private String street;
    private String number;
    private String complement;
    private String district; 
    private String city;
    private String state;
    private String zipCode;

    private boolean deliveryAddress = true;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
