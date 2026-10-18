
package com.inventory.inventory_management_system.controller;

import com.inventory.inventory_management_system.entity.Bill;
import com.inventory.inventory_management_system.entity.BillItem;
import com.inventory.inventory_management_system.Service.BillingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin("*")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBill(
            @RequestBody BillingService.BillRequest request) {
        try {
            Bill bill = billingService.createBill(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(bill);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billingService.getAllBills();
    }

    @GetMapping("/{billId}/items")
    public List<BillItem> getBillItems(@PathVariable Long billId) {
        return billingService.getBillItems(billId);
    }
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlySales(
            @RequestParam int year,
            @RequestParam int month) {
        try {
            Map<String, Object> result =
                    billingService.getMonthlySales(year, month);

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
