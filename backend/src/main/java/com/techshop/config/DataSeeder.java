package com.techshop.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    CommandLineRunner seed(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            // Schema migration: drop old unused columns if they exist
            try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN title_old"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN badge"); } catch(Exception e) {}
            // Schema migration: add new columns if not exist
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN sort_order INT DEFAULT 0"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN type VARCHAR(50) DEFAULT 'Hình ảnh'"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN position VARCHAR(20) DEFAULT 'SLIDER'"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN title VARCHAR(300)"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN background VARCHAR(500)"); } catch(Exception e) {}
            // Migrate old banners to SLIDER position
            try { jdbcTemplate.execute("UPDATE banner SET position='SLIDER' WHERE position IS NULL OR position=''"); } catch(Exception e) {}
            // Add sort_order to category if not exists
            try { jdbcTemplate.execute("ALTER TABLE category ADD COLUMN sort_order INT DEFAULT 0"); } catch(Exception e) {}
        };
    }
}

