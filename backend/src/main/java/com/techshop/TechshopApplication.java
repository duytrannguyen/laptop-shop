package com.techshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Điểm khởi động chính của ứng dụng Spring Boot.
 * Annotation @SpringBootApplication tự động cấu hình toàn bộ hệ thống:
 * - Quét và nạp tất cả Bean/Component trong package com.techshop
 * - Bật auto-configuration cho JPA, Security, Web, v.v.
 */
@SpringBootApplication
public class TechshopApplication {
    public static void main(String[] args) {
        SpringApplication.run(TechshopApplication.class, args);
    }
}
