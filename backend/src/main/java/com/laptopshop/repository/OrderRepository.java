package com.laptopshop.repository;

import com.laptopshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = "items")
    List<Order> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "items")
    List<Order> findByPhoneOrderByCreatedAtDesc(String phone);

    @EntityGraph(attributePaths = "items")
    Optional<Order> findWithItemsById(Long id);
}
