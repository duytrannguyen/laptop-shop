package com.laptopshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

@Service
public class AdminTokenService {
    private final byte[] secret;
    private final long ttlSeconds;

    public AdminTokenService(
            @Value("${app.token.secret}") String secret,
            @Value("${app.token.ttl-seconds}") long ttlSeconds) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
    }

    public String issue(String email) {
        long expiresAt = Instant.now().getEpochSecond() + ttlSeconds;
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(email.getBytes(StandardCharsets.UTF_8)) + "." + expiresAt;
        return payload + "." + sign(payload);
    }

    public boolean isValid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;
            String payload = parts[0] + "." + parts[1];
            long expiresAt = Long.parseLong(parts[1]);
            return expiresAt > Instant.now().getEpochSecond()
                    && MessageDigest.isEqual(sign(payload).getBytes(StandardCharsets.UTF_8),
                    parts[2].getBytes(StandardCharsets.UTF_8));
        } catch (Exception ignored) {
            return false;
        }
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tạo token", e);
        }
    }
}
