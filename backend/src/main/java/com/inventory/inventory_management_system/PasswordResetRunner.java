
package com.inventory.inventory_management_system;

import com.inventory.inventory_management_system.entity.User;
import com.inventory.inventory_management_system.repository.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetRunner implements CommandLineRunner {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetRunner(
            UserRepo userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String username = System.getenv("RESET_USERNAME");
        String newPassword = System.getenv("RESET_PASSWORD");

        if (username == null || username.isBlank()
                || newPassword == null || newPassword.isBlank()) {
            return;
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + username));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        System.out.println("Password reset completed for: " + username);
    }
}
