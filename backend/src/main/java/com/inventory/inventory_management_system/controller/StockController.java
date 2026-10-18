
package com.inventory.inventory_management_system.controller;

import com.inventory.inventory_management_system.Service.Productservice;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin("*")
public class StockController {

    private final Productservice productService;

    public StockController(Productservice productService) {
        this.productService = productService;
    }

    @PutMapping("/{id}/in")
    public String stockIn(
            @PathVariable Long id,
            @RequestParam int quantity) {

        productService.updateStock(id, quantity, true);
        return "Stock added successfully";
    }

    @PutMapping("/{id}/out")
    public String stockOut(
            @PathVariable Long id,
            @RequestParam int quantity,
            @RequestParam String customerName) {

        productService.updateStock(
                id, quantity, false, customerName
        );

        return "Stock removed successfully for customer: "
                + customerName;
    }
}
