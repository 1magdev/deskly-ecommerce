package com.app.deskly.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity

public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

   
    private String fileName;

  
    private String filePath;

    private Boolean isMain;

    @ManyToOne
 
    private Product product;
}

