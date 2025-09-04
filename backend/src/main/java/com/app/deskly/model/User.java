package com.app.deskly.model;

import lombok.Data;

@Data
public class User {
    private Long id;
    private String fullname;
    private String email;
    private String cpf;
    private String passwordHash;
    private Role role;
    private boolean active = true;
}
