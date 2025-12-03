package com.app.deskly.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
@Data
public class CustomerRequestDTO {

        @NotBlank(message = "Nome não pode ser vázio.")
        @Size(min = 4, max = 50, message = "Nome deve ter entre 4 e 50 cáracteres")
        private String fullname;

        @Email()
        @NotBlank(message = "Email não pode ser vázio")
        private String email;

        @NotBlank(message = "CPF não pode ser vázio")
        private String cpf;

        private String gender;

        private LocalDate birthDate;

        @NotBlank(message = "Senha não pode ser vázio")
        private String password;

        @NotBlank(message = "Confirme a senha!")
        private String confirmPassword;


}
