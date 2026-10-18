package com.inventory.inventory_management_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventoryManagementSystemApplication {

	public static void main(String[] args) {

		SpringApplication.run(InventoryManagementSystemApplication.class, args);
		System.out.println("\n==========================================");
		System.out.println("🚀 Inventory-management-system Backend is Running!");
		System.out.println("🌐 Server: http://localhost:8080");
		System.out.println("==========================================");
	}

}
