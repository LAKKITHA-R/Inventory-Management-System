package com.inventory.inventory_management_system.Service;

import com.inventory.inventory_management_system.entity.Bill;
import com.inventory.inventory_management_system.entity.Customer;
import com.inventory.inventory_management_system.repository.BillRepository;
import com.inventory.inventory_management_system.repository.CustomerRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BillRepository billRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            BillRepository billRepository) {
        this.customerRepository = customerRepository;
        this.billRepository = billRepository;
    }

    public List<Customer> getAllCustomers() {
        try {
            Map<String, Customer> customers = new LinkedHashMap<>();

            // Existing registered customers
            for (Customer customer : customerRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "id"))) {
                if (customer.getCustomerPhone() != null) {
                    customers.put(customer.getCustomerPhone(), customer);
                }
            }

            // Customers from existing bills
            for (Bill bill : billRepository.findAllByOrderByBillDateDesc()) {
                String phone = bill.getCustomerPhone();

                if (phone == null || phone.isBlank()) {
                    continue;
                }

                customers.putIfAbsent(phone, createCustomerFromBill(bill));
            }

            return new ArrayList<>(customers.values());

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    private Customer createCustomerFromBill(Bill bill) {
        Customer customer = new Customer();
        customer.setCustomerName(
                bill.getCustomerName() == null
                        ? "Unknown Customer"
                        : bill.getCustomerName()
        );
        customer.setCustomerPhone(bill.getCustomerPhone());
        return customer;
    }

    public Customer addCustomer(Customer customer) {
        if (customer.getCustomerName() == null
                || customer.getCustomerName().isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        if (customer.getCustomerPhone() == null
                || !customer.getCustomerPhone().matches("\\d{10,15}")) {
            throw new IllegalArgumentException(
                    "Enter a valid phone number (10-15 digits)");
        }

        if (customerRepository.existsByCustomerPhone(
                customer.getCustomerPhone())) {
            throw new IllegalArgumentException(
                    "Customer phone number already exists");
        }

        return customerRepository.save(customer);
    }
}