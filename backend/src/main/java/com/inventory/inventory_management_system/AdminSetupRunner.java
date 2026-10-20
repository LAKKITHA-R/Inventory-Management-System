
package com.inventory.inventory_management_system;

import com.inventory.inventory_management_system.Service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminSetupRunner implements CommandLineRunner {

    private final UserService userService;

    public AdminSetupRunner(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        String username = System.getenv("INITIAL_ADMIN_USERNAME");
        String password = System.getenv("INITIAL_ADMIN_PASSWORD");

        if (username != null && !username.isBlank()
                && password != null && !password.isBlank()) {

            userService.createAdminIfConfigured(username, password);

            System.out.println("Initial admin setup checked.");
        }
    }
}
