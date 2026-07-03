package com.techshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import java.nio.file.Path;

/**
 * Cấu hình Web MVC – phục vụ file tĩnh từ thư mục uploads.
 *
 * Khi admin upload ảnh, file được lưu vào thư mục uploads/ trên server.
 * Class này ánh xạ URL /uploads/** → thư mục thực tế trên ổ đĩa,
 * cho phép frontend hiển thị ảnh qua đường dẫn /uploads/products/abc.jpg, v.v.
 *
 * Thư mục upload cấu hình qua biến app.upload-dir trong application.properties.
 * Cache-Control: 1 ngày (86400 giây) để browser không tải lại ảnh mỗi lần.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final String uploadLocation;

    public WebConfig(@Value("${app.upload-dir}") String uploadDir) {
        // Chuyển đường dẫn tương đối thành URL tuyệt đối (dạng file://...)
        this.uploadLocation = Path.of(uploadDir).toAbsolutePath().normalize().toUri().toString();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL /uploads/** đến thư mục thực tế chứa ảnh đã upload
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation)
                .setCachePeriod(86400); // Cache 1 ngày
    }
}
