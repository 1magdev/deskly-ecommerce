package com.app.deskly.dto.user;

import com.app.deskly.model.Role;
import lombok.Data;

@Data
public class UpdateUserDTO {
    
    private String fullname;        
    private String cpf;             
    private String password;        
    private String confirmPassword; 
    private Role role;              
}