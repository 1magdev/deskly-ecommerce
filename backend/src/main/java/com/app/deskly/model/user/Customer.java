package com.app.deskly.model.user;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_customers")
@DiscriminatorValue("CUSTOMER")
@Data
public class Customer extends BaseUser {
    @Column(name = "gender")
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

/*
    // Informações de pagamento
    @Column(name = "card_holder_name")
    private String cardHolderName;

    @Column(name = "card_last_digits", length = 4)
    private String cardLastDigits;

    @Column(name = "card_brand")
    private String cardBrand;

    @Column(name = "card_expiration")
    private String cardExpiration;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses;*/
}
