package com.app.deskly.model.user;

import com.app.deskly.model.UserRoles;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.*;

@Entity
@Data
@Table(name = "tbl_users")
public class User implements AuthenticatedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRoles role;

    @Column(name = "active", nullable = false)
    private boolean active = true;

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
