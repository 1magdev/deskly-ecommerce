package com.app.deskly.dto;

import com.app.deskly.model.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequestDTO {
    @NotBlank(message = "Nome não pode ser vázio.")
    @Size(min = 4, max = 50, message = "Nome deve ter entre 4 e 50 cáracteres")
    private String fullname;

    @Email()
    @NotBlank(message = "Email não pode ser vázio")
    private String email;

    @NotBlank(message = "CPF não pode ser vázio")
    private String cpf;

    @NotBlank(message = "Senha não pode ser vázio")
    private String password;

    @NotBlank(message = "Confirme a senha!")
    private String confirmPassword;

    @NotBlank(message = "Cargo não pode ser vázio")
    private Role role;
}
