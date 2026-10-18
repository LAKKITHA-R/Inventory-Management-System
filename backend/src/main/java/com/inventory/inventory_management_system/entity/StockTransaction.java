
package com.inventory.inventory_management_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private String transactionType;

    private Integer quantity;

    private Integer quantityBefore;

    private Integer quantityAfter;

    private String username;

    @Column(name = "customer_name")
    private String customerName;

    private LocalDateTime transactionDate;


    public StockTransaction() {
    }

    // Existing constructor - preserved
    public StockTransaction(
            Long productId,
            String transactionType,
            Integer quantity,
            Integer quantityBefore,
            Integer quantityAfter,
            String username,
            LocalDateTime transactionDate) {

        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.quantityBefore = quantityBefore;
        this.quantityAfter = quantityAfter;
        this.username = username;
        this.transactionDate = transactionDate;
    }

    // Constructor with customer name
    public StockTransaction(
            Long productId,
            String transactionType,
            Integer quantity,
            Integer quantityBefore,
            Integer quantityAfter,
            String username,
            String customerName,
            LocalDateTime transactionDate) {

        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.quantityBefore = quantityBefore;
        this.quantityAfter = quantityAfter;
        this.username = username;
        this.customerName = customerName;
        this.transactionDate = transactionDate;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantityBefore() {
        return quantityBefore;
    }

    public void setQuantityBefore(Integer quantityBefore) {
        this.quantityBefore = quantityBefore;
    }

    public Integer getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(Integer quantityAfter) {
        this.quantityAfter = quantityAfter;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
