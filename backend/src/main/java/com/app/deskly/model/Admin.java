package com.app.deskly.model;

import com.app.deskly.model.user.User;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_admins")
@DiscriminatorValue("ADMIN")
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    @Column(name = "department")
    private String department;

    @Column(name = "access_level")
    private Integer accessLevel;
}
