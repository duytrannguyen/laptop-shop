package com.techshop.config.security;

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

    /**
     * Tạo token mới cho email admin.
     * Format: base64url(email).expireTimestamp.signature
     */
    public String issue(String email) {
        long expiresAt = Instant.now().getEpochSecond() + ttlSeconds;
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(email.getBytes(StandardCharsets.UTF_8)) + "." + expiresAt;
        return payload + "." + sign(payload);
    }

    /**
     * Kiểm tra token có hợp lệ không.
     * - Phải đúng 3 phần cách nhau bởi dấu "."
     * - Chưa hết hạn (timestamp > thời điểm hiện tại)
     * - Chữ ký HMAC khớp (xác nhận token chưa bị sửa đổi)
     */
    public boolean isValid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;
            String payload = parts[0] + "." + parts[1];
            long expiresAt = Long.parseLong(parts[1]);
            // So sánh thời hạn VÀ chữ ký bằng constant-time để chống timing attack
            return expiresAt > Instant.now().getEpochSecond()
                    && MessageDigest.isEqual(sign(payload).getBytes(StandardCharsets.UTF_8),
                    parts[2].getBytes(StandardCharsets.UTF_8));
        } catch (Exception ignored) {
            return false;
        }
    }

    /**
     * Tạo chữ ký HMAC-SHA256 cho payload.
     * Dùng khóa bí mật (app.token.secret) → ai không biết secret thì không thể làm giả chữ ký.
     */
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
