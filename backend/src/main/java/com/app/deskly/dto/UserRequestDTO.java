package com.app.deskly.dto;

import com.app.deskly.model.Role;
import lombok.Data;
@Data
public class UserRequestDTO {
    private String fullname;
    private String email;
    private String cpf;
    private String password;
    private String confirmPassword;
    private Role role;
}
