package com.inventory.inventory_management_system.repository;

import com.inventory.inventory_management_system.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Productrepo extends JpaRepository<Product, Long> {
}