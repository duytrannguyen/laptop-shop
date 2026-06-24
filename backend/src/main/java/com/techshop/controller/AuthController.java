package com.techshop.controller;

import com.techshop.config.AdminTokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

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

    record Login(@NotBlank @Email String email, @NotBlank String password) {}

    @PostMapping("/login")
    Map<String, Object> login(@Valid @RequestBody Login request) {
        boolean emailMatches = adminEmail.equalsIgnoreCase(request.email().trim());
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
