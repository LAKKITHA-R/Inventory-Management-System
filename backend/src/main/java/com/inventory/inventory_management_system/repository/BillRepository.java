
package com.inventory.inventory_management_system.repository;

import com.inventory.inventory_management_system.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDateTime;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findAllByOrderByBillDateDesc();

    List<Bill> findByBillDateBetweenOrderByBillDateDesc(
            LocalDateTime start,
            LocalDateTime end
    );
}
