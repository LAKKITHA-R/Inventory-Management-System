
package com.inventory.inventory_management_system.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final String SECRET_KEY;

    private final long EXPIRATION_TIME = 1000L * 60 * 60;

    public JwtService() {
        this.SECRET_KEY = System.getenv("JWT_SECRET");

        if (this.SECRET_KEY == null || this.SECRET_KEY.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is not configured"
            );
        }
    }

    public SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }
}
