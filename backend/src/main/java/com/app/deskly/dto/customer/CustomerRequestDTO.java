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

        //dados de endereço de entrega e endereço de faturamento

        @NotBlank(message = "O CEP não pode ser vazio")
        private String CEP;

        @NotBlank(message = "O logradouro não pode ser vazio")
        private String logradouro;

        @NotBlank(message = "O número não pode ser vazio")
        private String number;

        @NotBlank(message = "O complemento não pode ser vazio")
        private String complement;

        @NotBlank(message = "O bairro não pode ser vazio")
        private String bairro;

        @NotBlank(message = "A cidade não pode ser vazia")
        private String city;

        @NotBlank(message = "O UF não pode ser vazio")
        private String uf;

}
