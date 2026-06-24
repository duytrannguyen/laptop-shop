package com.techshop.repository;

import com.techshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByActiveTrueOrderBySortOrderAscNameAsc();

    /** Tất cả category sắp theo sortOrder rồi name */
    List<Category> findAllByOrderBySortOrderAscNameAsc();

    /** Lấy các danh mục không có cha (root categories), sắp xếp theo sortOrder */
    @Query("SELECT c FROM Category c WHERE c.parents IS EMPTY ORDER BY c.sortOrder ASC, c.name ASC")
    List<Category> findRootCategories();

    /** Lấy các danh mục root đang active (cho public API) */
    @Query("SELECT c FROM Category c WHERE c.parents IS EMPTY AND c.active = true ORDER BY c.sortOrder ASC, c.name ASC")
    List<Category> findActiveRootCategories();
}
