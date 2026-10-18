package com.inventory.inventory_management_system.repository;

import com.inventory.inventory_management_system.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepo extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByProductId(Long productId);
}