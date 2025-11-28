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

    @Column(name = "phone")
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
}
