package com.techshop.controller;

import com.techshop.config.security.AdminTokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

/**
 * Controller xử lý đăng nhập cho Admin.
 *
 * Endpoint: POST /api/auth/login
 * - Nhận email và password từ body request
 * - So sánh với thông tin admin cấu hình trong application.properties
 * - Nếu đúng → tạo và trả về token (dùng cho các API /admin/** tiếp theo)
 * - Nếu sai → trả về 401 Unauthorized
 *
 * Lưu ý bảo mật: So sánh password bằng MessageDigest.isEqual() để chống timing attack
 * (tránh lộ thông tin qua thời gian phản hồi khác nhau).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final String adminEmail;
    private final String adminPassword;
    private final AdminTokenService tokenService;

    public AuthController(
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            AdminTokenService tokenService) {
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.tokenService = tokenService;
    }

    // Record nội bộ để nhận dữ liệu đăng nhập từ request body
    record Login(@NotBlank @Email String email, @NotBlank String password) {}

    /**
     * Đăng nhập Admin.
     * Trả về: { token, role, name }
     */
    @PostMapping("/login")
    Map<String, Object> login(@Valid @RequestBody Login request) {
        boolean emailMatches = adminEmail.equalsIgnoreCase(request.email().trim());
        // So sánh constant-time để chống timing attack
        boolean passwordMatches = MessageDigest.isEqual(
                adminPassword.getBytes(StandardCharsets.UTF_8),
                request.password().getBytes(StandardCharsets.UTF_8));

        if (!emailMatches || !passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai tài khoản hoặc mật khẩu");
        }

        return Map.of(
                "token", tokenService.issue(adminEmail),
                "role", "ADMIN",
                "name", "Tech Shop Admin");
    }
}
