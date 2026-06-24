package com.techshop.repository;

import com.techshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlugAndActiveTrue(String slug);
    List<Product> findByActiveTrueOrderByIdDesc();
    List<Product> findByFeaturedTrueAndActiveTrueOrderByIdDesc();
    List<Product> findByCategorySlugAndActiveTrueOrderByIdDesc(String slug);
    long countByCategoryId(Long categoryId);
}
