package com.app.deskly.dto.address;

import lombok.Data;

@Data
public class AddressResponseDTO {

    private Long id;

    private String label;
    private String street;
    private String number;
    private String complement;
    private String district;
    private String city;
    private String state;
    private String zipCode;

    private boolean deliveryAddress;
    private boolean paymentAddress = true;

}
