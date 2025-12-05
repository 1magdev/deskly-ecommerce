package com.app.deskly.repository;

import com.app.deskly.model.Order;
import com.app.deskly.model.user.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerOrderByCreatedAtDesc(Customer customer);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Order> findAllByOrderByCreatedAtDesc();
}
