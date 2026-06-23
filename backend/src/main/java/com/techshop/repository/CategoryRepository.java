package com.techshop.repository;

import com.techshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByActiveTrueOrderByNameAsc();
}
