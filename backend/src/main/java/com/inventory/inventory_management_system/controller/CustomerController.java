package com.inventory.inventory_management_system.controller;

import com.inventory.inventory_management_system.Service.CustomerService;
import com.inventory.inventory_management_system.Service.BillingService;
import com.inventory.inventory_management_system.entity.Bill;
import com.inventory.inventory_management_system.entity.BillItem;
import com.inventory.inventory_management_system.entity.Customer;
import com.inventory.inventory_management_system.repository.BillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin("*")
public class CustomerController {

    private final CustomerService customerService;
    private final BillingService billingService;
    private final BillRepository billRepository;

    public CustomerController(
            CustomerService customerService,
            BillingService billingService,
            BillRepository billRepository) {
        this.customerService = customerService;
        this.billingService = billingService;
        this.billRepository = billRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllCustomers() {
        try {
            return ResponseEntity.ok(customerService.getAllCustomers());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() == null
                            ? "Unable to load customers"
                            : e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addCustomer(@RequestBody Customer customer) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(customerService.addCustomer(customer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{phone}/activities")
    public ResponseEntity<?> getCustomerActivities(
            @PathVariable String phone,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        try {
            LocalDate fromDate = from == null || from.isBlank()
                    ? LocalDate.of(2000, 1, 1)
                    : LocalDate.parse(from);

            LocalDate toDate = to == null || to.isBlank()
                    ? LocalDate.now().plusDays(1)
                    : LocalDate.parse(to);

            List<Bill> bills = billRepository
                    .findByCustomerPhoneOrderByBillDateDesc(phone);

            List<Map<String, Object>> activities = new ArrayList<>();

            for (Bill bill : bills) {
                if (bill.getBillDate() == null) {
                    continue;
                }

                LocalDate billDate = bill.getBillDate().toLocalDate();

                if (billDate.isBefore(fromDate) || billDate.isAfter(toDate)) {
                    continue;
                }

                List<BillItem> items = billingService.getBillItems(bill.getId());
                List<Map<String, Object>> products = new ArrayList<>();

                for (BillItem item : items) {
                    Map<String, Object> product = new LinkedHashMap<>();

                    product.put(
                            "productName",
                            item.getProduct() != null
                                    ? item.getProduct().getName()
                                    : "Product unavailable"
                    );
                    product.put("quantity", item.getQuantity());
                    product.put("sellingPrice", item.getSellingPrice());
                    product.put("subtotal", item.getSubtotal());

                    products.add(product);
                }

                Map<String, Object> activity = new LinkedHashMap<>();
                activity.put("billId", bill.getId());
                activity.put("billNumber", bill.getBillNumber());
                activity.put("billDate", bill.getBillDate());
                activity.put("totalAmount", bill.getTotalAmount());
                activity.put("status", bill.getStatus());
                activity.put("products", products);

                activities.add(activity);
            }

            return ResponseEntity.ok(activities);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Unable to load customer activities")
            );
        }
    }
}