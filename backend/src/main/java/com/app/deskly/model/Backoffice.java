package com.app.deskly.model;

import com.app.deskly.model.user.User;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_backoffice")
@DiscriminatorValue("BACKOFFICE")
@Data
@EqualsAndHashCode(callSuper = true)
public class Backoffice extends User {

    @Column(name = "department")
    private String department;

    @Column(name = "responsibilities")
    private String responsibilities;
}
