package com.app.deskly.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.deskly.model.Address;
import com.app.deskly.model.user.Customer;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByCustomerAndDeliveryAddressTrue(Customer customer);
    List<Address> findByCustomerAndPaymentAddressTrue(Customer customer);
    List<Address> findByCustomer(Customer customer);
}