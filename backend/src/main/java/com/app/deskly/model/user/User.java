package com.app.deskly.model.user;

import com.app.deskly.model.UserRoles;
import lombok.Data;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@Data
public class User extends BaseUser {

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRoles role;

    @Column(name = "active", nullable = false)
    private boolean active = true;

}
