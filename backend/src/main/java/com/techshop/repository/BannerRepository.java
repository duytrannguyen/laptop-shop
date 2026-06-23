package com.techshop.repository;

import com.techshop.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActiveTrueOrderBySortOrderAscIdAsc();
    List<Banner> findAllByOrderBySortOrderAscIdAsc();
    List<Banner> findByPositionAndActiveTrueOrderBySortOrderAscIdAsc(String position);
    List<Banner> findByPositionOrderBySortOrderAscIdAsc(String position);
}
