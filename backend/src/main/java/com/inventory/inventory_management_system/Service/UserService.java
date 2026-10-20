
package com.inventory.inventory_management_system.Service;

import com.inventory.inventory_management_system.entity.User;
import com.inventory.inventory_management_system.repository.UserRepo;
import com.inventory.inventory_management_system.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepo userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("STAFF");

        return userRepository.save(user);
    }

    public void createAdminIfConfigured(
            String username, String password) {

        if (username == null || username.isBlank()
                || password == null || password.isBlank()) {
            return;
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("ADMIN");

        userRepository.save(admin);
    }

    public String loginUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        return jwtService.generateToken(
                user.getUsername(),
                user.getRole()
        );
    }
}
