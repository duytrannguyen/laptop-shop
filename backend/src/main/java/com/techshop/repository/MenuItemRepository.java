package com.techshop.repository;

import com.techshop.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByTypeOrderBySortOrderAsc(String type);
    List<MenuItem> findByParentIdOrderBySortOrderAsc(Long parentId);
    void deleteByParentId(Long parentId);
}
