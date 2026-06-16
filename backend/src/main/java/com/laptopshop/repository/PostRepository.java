package com.laptopshop.repository;

import com.laptopshop.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByActiveTrueOrderByCreatedAtDesc();
    Optional<Post> findBySlugAndActiveTrue(String slug);
}
