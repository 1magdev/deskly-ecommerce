package com.app.deskly.model;

import lombok.Data;
import jakarta.persistence.*;
import java.util.List;
import java.time.LocalDate;


@Entity
@Table(name = "tbl_users")
@Data
public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Informações pessoais
    @Column(name = "fullname", nullable = false)
    private String fullname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "cpf", nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(name = "gender")
    private String gender; // Exemplo: "Masculino", "Feminino", "Outro"

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRoles role;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    // Endereço de entrega
    @Column(name = "address_street")
    private String addressStreet;

    @Column(name = "address_number")
    private String addressNumber;

    @Column(name = "address_complement")
    private String addressComplement;

    @Column(name = "address_neighborhood")
    private String addressNeighborhood;

    @Column(name = "address_city")
    private String addressCity;

    @Column(name = "address_state")
    private String addressState;

    @Column(name = "address_zipcode")
    private String addressZipcode;

    // Informações de pagamento
    @Column(name = "card_holder_name")
    private String cardHolderName;

    @Column(name = "card_last_digits", length = 4)
    private String cardLastDigits;

    @Column(name = "card_brand")
    private String cardBrand; // Visa, MasterCard

    @Column(name = "card_expiration")
    private String cardExpiration;

    //  Contato adicional
    @Column(name = "phone")
    private String phone;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses;

}

