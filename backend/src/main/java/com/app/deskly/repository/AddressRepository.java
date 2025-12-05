package com.app.deskly.repository;

import com.app.deskly.model.Address;
import com.app.deskly.model.user.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByCustomerAndDeliveryAddressTrue(Customer customer);
    List<Address> findByCustomer(Customer customer);
}
