package com.laptopshop.repository;

import com.laptopshop.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActiveTrueOrderBySortOrderAscIdAsc();
    List<Banner> findAllByOrderBySortOrderAscIdAsc();
}
