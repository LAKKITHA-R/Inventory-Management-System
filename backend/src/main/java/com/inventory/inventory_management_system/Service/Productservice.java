
package com.inventory.inventory_management_system.Service;

import com.inventory.inventory_management_system.entity.Product;
import com.inventory.inventory_management_system.entity.StockTransaction;
import com.inventory.inventory_management_system.repository.Productrepo;
import com.inventory.inventory_management_system.repository.StockTransactionRepo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class Productservice {

    private final Productrepo productRepository;
    private final StockTransactionRepo stockTransactionRepo;

    public Productservice(
            Productrepo productRepository,
            StockTransactionRepo stockTransactionRepo) {
        this.productRepository = productRepository;
        this.stockTransactionRepo = stockTransactionRepo;
    }

    // Get logged-in username
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    // CREATE
    public Product addProduct(Product product) {
        Product savedProduct = productRepository.save(product);

        StockTransaction transaction = new StockTransaction(
                savedProduct.getId(),
                "ADD",
                savedProduct.getQuantity(),
                0,
                savedProduct.getQuantity(),
                getCurrentUsername(),
                LocalDateTime.now()
        );

        stockTransactionRepo.save(transaction);
        return savedProduct;
    }

    // READ ALL
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // READ ONE
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
    }

    // UPDATE PRODUCT
    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int oldQuantity = existingProduct.getQuantity();
        int newQuantity = updatedProduct.getQuantity();

        if (newQuantity < 0) {
            throw new RuntimeException(
                    "Quantity cannot be negative");
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setProduct_code(
                updatedProduct.getProduct_code());
        existingProduct.setDescription(
                updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setPurchasePrice(
                updatedProduct.getPurchasePrice());
        existingProduct.setQuantity(newQuantity);
        existingProduct.setMinimumStock(
                updatedProduct.getMinimumStock());

        Product savedProduct =
                productRepository.save(existingProduct);

        // Save transaction if quantity changes
        if (oldQuantity != newQuantity) {

            String transactionType =
                    newQuantity > oldQuantity ? "IN" : "OUT";

            int changedQuantity =
                    Math.abs(newQuantity - oldQuantity);

            StockTransaction transaction = new StockTransaction(
                    id,
                    transactionType,
                    changedQuantity,
                    oldQuantity,
                    newQuantity,
                    getCurrentUsername(),
                    LocalDateTime.now()
            );

            stockTransactionRepo.save(transaction);
        }

        return savedProduct;
    }

    // Keep compatibility with existing 3-argument calls
    public void updateStock(
            Long id, int quantity, boolean isStockIn) {
        updateStock(id, quantity, isStockIn, null);
    }

    // STOCK IN / STOCK OUT
    @Transactional
    public void updateStock(
            Long id,
            int quantity,
            boolean isStockIn,
            String customerName) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        if (!isStockIn &&
                (customerName == null ||
                        customerName.trim().isEmpty())) {
            throw new RuntimeException(
                    "Customer name is required for Stock OUT");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int oldQuantity = product.getQuantity();
        int newQuantity;

        if (isStockIn) {
            newQuantity = oldQuantity + quantity;
        } else {
            if (quantity > oldQuantity) {
                throw new RuntimeException(
                        "Insufficient stock");
            }

            newQuantity = oldQuantity - quantity;
        }

        product.setQuantity(newQuantity);
        productRepository.save(product);

        StockTransaction transaction = new StockTransaction(
                id,
                isStockIn ? "IN" : "OUT",
                quantity,
                oldQuantity,
                newQuantity,
                getCurrentUsername(),
                LocalDateTime.now()
        );

        // Save customer name only for Stock OUT
        if (!isStockIn) {
            transaction.setCustomerName(customerName.trim());
        }

        stockTransactionRepo.save(transaction);
    }

    // DELETE
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        productRepository.delete(product);
    }

    // LOW STOCK
    public List<Product> getLowStockProducts() {
        return productRepository.findAll()
                .stream()
                .filter(product ->
                        product.getQuantity()
                                <= product.getMinimumStock())
                .toList();
    }

    // DASHBOARD
    public long getTotalProducts() {
        return productRepository.count();
    }

    public long getTotalStockQuantity() {
        return productRepository.findAll()
                .stream()
                .mapToLong(Product::getQuantity)
                .sum();
    }

    public long getLowStockCount() {
        return productRepository.findAll()
                .stream()
                .filter(p ->
                        p.getQuantity() <= p.getMinimumStock())
                .count();
    }
}
