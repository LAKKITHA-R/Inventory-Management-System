
package com.inventory.inventory_management_system.Service;

import com.inventory.inventory_management_system.entity.Bill;
import com.inventory.inventory_management_system.entity.BillItem;
import com.inventory.inventory_management_system.entity.Product;
import com.inventory.inventory_management_system.repository.BillRepository;
import com.inventory.inventory_management_system.repository.BillItemRepository;
import com.inventory.inventory_management_system.repository.Productrepo;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Map;
import java.util.HashMap;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final Productrepo productRepository;

    public BillingService(
            BillRepository billRepository,
            BillItemRepository billItemRepository,
            Productrepo productRepository) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.productRepository = productRepository;
    }

    public static class BillRequest {
        public String customerName;
        public String customerPhone;
        public BigDecimal gstRate;
        public List<ItemRequest> items;
    }

    public static class ItemRequest {
        public Long productId;
        public int quantity;
    }

    @Transactional
    public Bill createBill(BillRequest request) {

        if (request == null || request.items == null
                || request.items.isEmpty()) {
            throw new IllegalArgumentException(
                    "Bill must contain at least one product");
        }

        // Default to 18% if no GST rate is supplied.
        BigDecimal gstRate = request.gstRate == null
                ? BigDecimal.valueOf(18)
                : request.gstRate;

        List<BigDecimal> allowedRates = List.of(
                BigDecimal.ZERO,
                BigDecimal.valueOf(5),
                BigDecimal.valueOf(12),
                BigDecimal.valueOf(18),
                BigDecimal.valueOf(28)
        );

        boolean validRate = allowedRates.stream()
                .anyMatch(rate -> rate.compareTo(gstRate) == 0);

        if (!validRate) {
            throw new IllegalArgumentException(
                    "GST rate must be 0, 5, 12, 18, or 28");
        }

        Bill bill = new Bill();

        bill.setBillNumber(
                "ROBO-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        bill.setCustomerName(request.customerName);
        bill.setCustomerPhone(request.customerPhone);
        bill.setGstRate(gstRate);
        bill.setTotalAmount(BigDecimal.ZERO);
        bill.setTotalCost(BigDecimal.ZERO);

        bill = billRepository.save(bill);

        BigDecimal subtotalTotal = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (ItemRequest item : request.items) {

            if (item.productId == null || item.quantity <= 0) {
                throw new IllegalArgumentException(
                        "Product ID and positive quantity are required");
            }

            Product product = productRepository
                    .findById(item.productId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + item.productId));

            if (product.getQuantity() < item.quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName());
            }

            BigDecimal sellingPrice =
                    BigDecimal.valueOf(product.getPrice());

            BigDecimal purchasePrice =
                    BigDecimal.valueOf(product.getPurchasePrice());

            BigDecimal quantity =
                    BigDecimal.valueOf(item.quantity);

            BigDecimal subtotal = sellingPrice.multiply(quantity);
            BigDecimal cost = purchasePrice.multiply(quantity);

            subtotalTotal = subtotalTotal.add(subtotal);
            totalCost = totalCost.add(cost);

            BillItem billItem = new BillItem();
            billItem.setBill(bill);
            billItem.setProduct(product);
            billItem.setQuantity(item.quantity);
            billItem.setSellingPrice(sellingPrice);
            billItem.setPurchasePrice(purchasePrice);
            billItem.setSubtotal(subtotal);

            billItemRepository.save(billItem);

            // Reduce stock after the sale.
            product.setQuantity(product.getQuantity() - item.quantity);
            productRepository.save(product);
        }

        // Calculate GST on the subtotal.
        BigDecimal gstAmount = subtotalTotal
                .multiply(gstRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal grandTotal = subtotalTotal
                .add(gstAmount)
                .setScale(2, RoundingMode.HALF_UP);

        // Save final bill amount, including GST.
        bill.setTotalAmount(grandTotal);
        bill.setTotalCost(totalCost.setScale(2, RoundingMode.HALF_UP));

        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByBillDateDesc();
    }

    public List<BillItem> getBillItems(Long billId) {
        if (!billRepository.existsById(billId)) {
            throw new IllegalArgumentException("Bill not found");
        }

        return billItemRepository.findByBillId(billId);
    }

    public Map<String, Object> getMonthlySales(int year, int month) {

        if (month < 1 || month > 12) {
            throw new IllegalArgumentException(
                    "Month must be between 1 and 12");
        }

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDateTime start = yearMonth
                .atDay(1)
                .atStartOfDay();

        LocalDateTime end = yearMonth
                .plusMonths(1)
                .atDay(1)
                .atStartOfDay()
                .minusNanos(1);

        List<Bill> bills =
                billRepository.findByBillDateBetweenOrderByBillDateDesc(
                        start, end
                );

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal cost = BigDecimal.ZERO;
        long billCount = 0;

        for (Bill bill : bills) {
            if ("COMPLETED".equalsIgnoreCase(bill.getStatus())) {
                revenue = revenue.add(bill.getTotalAmount());
                cost = cost.add(bill.getTotalCost());
                billCount++;
            }
        }

        BigDecimal profit = revenue.subtract(cost);

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("totalRevenue", revenue);
        result.put("totalCost", cost);
        result.put("grossProfit", profit);
        result.put("totalBills", billCount);

        return result;
    }
}
