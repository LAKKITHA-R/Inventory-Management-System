package com.inventory.inventory_management_system.repository;

import com.inventory.inventory_management_system.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerPhone(String customerPhone);

    boolean existsByCustomerPhone(String customerPhone);
}