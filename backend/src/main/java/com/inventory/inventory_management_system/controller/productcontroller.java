package com.inventory.inventory_management_system.controller;

import com.inventory.inventory_management_system.Service.Productservice;
import com.inventory.inventory_management_system.entity.Product;
import com.inventory.inventory_management_system.entity.StockTransaction;
import com.inventory.inventory_management_system.repository.StockTransactionRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import java.util.LinkedHashMap;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/product")
@CrossOrigin("*")
public class productcontroller {

    private final Productservice productservice;
    private final StockTransactionRepo stockTransactionRepo;

    // Constructor Injection
    public productcontroller(Productservice productService,
                             StockTransactionRepo stockTransactionRepo) {
        this.productservice = productService;
        this.stockTransactionRepo = stockTransactionRepo;
    }

    // Add Product
    @PostMapping
    public Product addProduct(@Valid @RequestBody Product product) {
        return productservice.addProduct(product);
    }


    // Return product details based on the logged-in role
    private Map<String, Object> productResponse(
            Product product, Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", product.getId());
        result.put("name", product.getName());
        result.put("product_code", product.getProduct_code());
        result.put("description", product.getDescription());
        result.put("price", product.getPrice());
        result.put("quantity", product.getQuantity());
        result.put("minimumStock", product.getMinimumStock());

        // Only Admin receives purchase cost
        if (isAdmin) {
            result.put("purchasePrice", product.getPurchasePrice());
        }

        return result;
    }

    // Get All Products
    @GetMapping
    public List<Map<String, Object>> getAllProducts(
            Authentication authentication) {

        return productservice.getAllProducts()
                .stream()
                .map(product -> productResponse(product, authentication))
                .toList();
    }

    // Get Low Stock Products
    @GetMapping("/low-stock")
    public List<Map<String, Object>> getLowStockProducts(
            Authentication authentication) {

        return productservice.getLowStockProducts()
                .stream()
                .map(product -> productResponse(product, authentication))
                .toList();
    }

    // Get Product By ID
    @GetMapping("/{id}")
    public Map<String, Object> getProductById(
            @PathVariable Long id,
            Authentication authentication) {

        Product product = productservice.getProductById(id);
        return productResponse(product, authentication);
    }

    // Update Product
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product) {

        return productservice.updateProduct(id, product);
    }

    // Delete Product
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {

        productservice.deleteProduct(id);

        return "Product deleted successfully";
    }

    // Get Stock History
    @GetMapping("/{id}/stock-history")
    public List<StockTransaction> getStockHistory(@PathVariable Long id) {
        return stockTransactionRepo.findByProductId(id);
    }

}