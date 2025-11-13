package com.app.deskly.dto.user;

import com.app.deskly.model.UserRoles;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserDTO {
    // Informações pessoais
    private String fullname;
    private String cpf;
    private String gender;
    private LocalDate birthDate;
    private String password;
    private String confirmPassword;
    private UserRoles role;

    // Endereço de entrega
    private String addressStreet;
    private String addressNumber;
    private String addressComplement;
    private String addressNeighborhood;
    private String addressCity;
    private String addressState;
    private String addressZipcode;

    // Informações de pagamento
    private String cardHolderName;
    private String cardLastDigits;
    private String cardBrand;
    private String cardExpiration;

    // Contato adicional
    private String phone;
}