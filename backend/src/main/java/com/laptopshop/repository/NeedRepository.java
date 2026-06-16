package com.laptopshop.repository;

import com.laptopshop.entity.Need;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NeedRepository extends JpaRepository<Need, Long> {
}
