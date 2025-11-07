package com.app.deskly.model;

import lombok.Data;
import jakarta.persistence.*;
import org.springframework.http.ResponseEntity;

@Entity
@Table(name = "tbl_users")
@Data
public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "email")
    private String email;

    @Column(name = "cpf")
    private String cpf;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private UserRoles role;

    @Column(name = "active")
    private boolean active = true;
}