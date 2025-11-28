package com.app.deskly.mapper;

import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.model.Address;

public class AddressMapper {

    public static AddressResponseDTO toResponseDTO(Address address) {
        if (address == null) {
            return null;
        }

        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setId(address.getId());
        dto.setLabel(address.getLabel());
        dto.setStreet(address.getStreet());
        dto.setNumber(address.getNumber());
        dto.setComplement(address.getComplement());
        dto.setDistrict(address.getDistrict());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setZipCode(address.getZipCode());
        dto.setDeliveryAddress(address.isDeliveryAddress());

        return dto;
    }
}
