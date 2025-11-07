package com.app.deskly.dto.user;

import com.app.deskly.model.UserRoles;
import lombok.Data;

@Data
public class UpdateUserDTO {
    
    private String fullname;        
    private String cpf;             
    private String password;        
    private String confirmPassword; 
    private UserRoles role;              
}