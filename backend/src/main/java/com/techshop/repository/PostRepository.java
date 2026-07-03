package com.techshop.repository;

import com.techshop.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByActiveTrueOrderByCreatedAtDesc();
    Optional<Post> findBySlugAndActiveTrue(String slug);
    List<Post> findByTypeOrderByCreatedAtDesc(String type);
    List<Post> findByTypeAndActiveTrueOrderByCreatedAtDesc(String type);
    boolean existsBySlug(String slug);
}
