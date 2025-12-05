package com.app.deskly.service;

import com.app.deskly.dto.address.AddressRequestDTO;
import com.app.deskly.dto.address.AddressResponseDTO;
import com.app.deskly.model.Address;
import com.app.deskly.model.user.Customer;
import com.app.deskly.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<AddressResponseDTO> listAddresses(Customer user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        List<Address> addresses = addressRepository.findByCustomer(user);

        return addresses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AddressResponseDTO createAddress(Customer user, AddressRequestDTO dto) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Address address = new Address();
        address.setCustomer(user);
        address.setLabel(dto.getLabel());
        address.setStreet(dto.getStreet());
        address.setNumber(dto.getNumber());
        address.setComplement(dto.getComplement());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setDeliveryAddress(dto.isDeliveryAddress());

        if (dto.isDeliveryAddress()) {
            List<Address> currentDeliveryAddresses = addressRepository.findByCustomerAndDeliveryAddressTrue(user);

            for (Address addr : currentDeliveryAddresses) {
                addr.setDeliveryAddress(false);
                addressRepository.save(addr); // SAVE, não DELETE!
            }
        }

        Address saved = addressRepository.save(address);
        return toResponse(saved);
    }

    public AddressResponseDTO updateAddress(Customer user, Long id, AddressRequestDTO dto) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado."));

        if (!address.getCustomer().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endereço não pertence ao usuário logado.");
        }

        address.setLabel(dto.getLabel());
        address.setStreet(dto.getStreet());
        address.setNumber(dto.getNumber());
        address.setComplement(dto.getComplement());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setDeliveryAddress(dto.isDeliveryAddress());

        if (dto.isDeliveryAddress()) {
            List<Address> currentDeliveryAddresses = addressRepository.findByCustomerAndDeliveryAddressTrue(user);

            for (Address addr : currentDeliveryAddresses) {
                addr.setDeliveryAddress(false);
                addressRepository.save(addr); // SAVE, não DELETE!
            }
        }
        Address saved = addressRepository.save(address);
        return toResponse(saved);
    }

    public void deleteAddress(Customer user, Long id) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado."));

        if (!address.getCustomer().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endereço não pertence ao usuário logado.");
        }

        addressRepository.delete(address);
    }

    private AddressResponseDTO toResponse(Address address) {
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
