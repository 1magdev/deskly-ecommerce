package com.app.deskly.dto.user;

import com.app.deskly.model.Role;
import lombok.Data;

@Data
public class UserDTO {

    private Long id;
    private String fullname;
    private String email;
    private String cpf;
    private Role role;
    private Boolean active;

}
