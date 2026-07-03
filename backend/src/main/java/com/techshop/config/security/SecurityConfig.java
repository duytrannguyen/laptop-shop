package com.techshop.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.*;

/**
 * Cấu hình bảo mật cho toàn bộ ứng dụng (Spring Security).
 *
 * Nhiệm vụ chính:
 * - Tắt CSRF (không dùng session-based form) vì dùng stateless JWT token
 * - Phân quyền: chỉ ADMIN mới vào được /api/admin/**, còn lại cho phép tất cả
 * - Gắn AdminTokenFilter vào chuỗi filter để kiểm tra token trước mọi request
 * - Cấu hình CORS: cho phép frontend gọi API từ domain được cấu hình trong application.properties
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final AdminTokenFilter adminTokenFilter;

    @Bean
    SecurityFilterChain filter(HttpSecurity http) throws Exception {
        return http
                // Tắt CSRF vì frontend dùng JWT token (stateless), không dùng cookie session
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                // Không lưu session phía server, mỗi request phải tự mang token
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Chỉ ADMIN mới được truy cập các API quản trị
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Tất cả các API còn lại đều công khai (không cần đăng nhập)
                        .anyRequest().permitAll())
                // Gắn filter kiểm tra token TRƯỚC filter xác thực mặc định của Spring
                .addFilterBefore(adminTokenFilter, UsernamePasswordAuthenticationFilter.class)
                // Cho phép load nội dung từ cùng domain (dùng cho iframe CKEditor)
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .build();
    }

    /**
     * Cấu hình CORS – cho phép frontend (React) gọi API.
     * Domain được cấu hình qua biến môi trường CORS_ALLOWED_ORIGINS trong application.properties.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Location"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
