package com.techshop.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;

/**
 * Tự động chạy migration schema khi ứng dụng khởi động.
 *
 * Mục đích: Xử lý các thay đổi cấu trúc database (ALTER TABLE) không được Hibernate JPA
 * tự động hỗ trợ khi dùng ddl-auto=update (ví dụ: xóa cột, đổi tên cột).
 *
 * Tất cả các lệnh được bọc trong try-catch để bỏ qua nếu đã tồn tại/đã thực hiện rồi.
 * Đây là cách đơn giản để "vá" database cho các môi trường cũ mà không cần Flyway/Liquibase.
 */
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    CommandLineRunner seed(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            // --- Migration bảng BANNER ---
            // Xóa các cột cũ không còn dùng (nếu vẫn tồn tại từ phiên bản trước)
            try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN title_old"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN badge"); } catch(Exception e) {}

            // Thêm các cột mới cho banner nếu chưa tồn tại
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN sort_order INT DEFAULT 0"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN type VARCHAR(50) DEFAULT 'Hình ảnh'"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN position VARCHAR(20) DEFAULT 'SLIDER'"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN title VARCHAR(300)"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN background VARCHAR(500)"); } catch(Exception e) {}

            // Gán vị trí mặc định cho banner cũ chưa có position
            try { jdbcTemplate.execute("UPDATE banner SET position='SLIDER' WHERE position IS NULL OR position=''"); } catch(Exception e) {}

            // --- Migration bảng CATEGORY ---
            // Thêm cột sort_order để hỗ trợ kéo thả sắp xếp danh mục
            try { jdbcTemplate.execute("ALTER TABLE category ADD COLUMN sort_order INT DEFAULT 0"); } catch(Exception e) {}
        };
    }
}
