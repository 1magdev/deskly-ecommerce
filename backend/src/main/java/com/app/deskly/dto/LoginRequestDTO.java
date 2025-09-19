package com.app.deskly.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @Email
    @NotBlank(message = "Email não pode ser vazio")
    private String email;

    @NotBlank(message = "Senha não pode ser vazia")
    private String password;
}