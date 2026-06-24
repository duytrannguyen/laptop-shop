package com.techshop;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
class SchemaTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void checkSchema() {
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList("SHOW COLUMNS FROM product");
            for(Map<String, Object> col : columns) {
                System.out.println(col.get("Field") + " - " + col.get("Null") + " - " + col.get("Type"));
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
