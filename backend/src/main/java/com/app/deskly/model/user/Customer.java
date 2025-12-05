package com.app.deskly.model.user;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "tbl_customers")
public class Customer implements AuthenticatedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "gender")
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "fullname", nullable = false)
    private String fullname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // cadastro de endereço entrega

    @Column(name = "cep", nullable = false, unique = true, length = 8)
        private String CEP;

    @Column(name = "logradouro", nullable = false, unique = true)
        private String logradouro;

    @Column(name = "número", nullable = false, unique = true)
        private String number;

    @Column(name = "complemento", nullable = false, unique = true)
        private String complement;

    @Column(name = "bairro", nullable = false, unique = true)
        private String bairro;

    @Column(name = "cidade", nullable = false, unique = true)
        private String city;

    @Column(name = "UF", nullable = false, unique = true, length = 2)
        private String uf;
}

