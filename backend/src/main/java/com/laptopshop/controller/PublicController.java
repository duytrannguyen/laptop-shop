package com.laptopshop.controller;

import com.laptopshop.dto.ContactRequest;
import com.laptopshop.entity.*;
import com.laptopshop.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicController {
    private final CategoryRepository categories;
    private final BrandRepository brands;
    private final ProductGroupRepository productGroups;
    private final NeedRepository needs;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    public String fixDb() {
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN brand VARCHAR(100) NULL"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN `condition` VARCHAR(255) NULL"); } catch(Exception e) {}
        return "DB Fixed";
    }

    private final ProductRepository products;
    private final PostRepository posts;
    private final BannerRepository banners;
    private final SiteSettingRepository settings;
    private final ContactMessageRepository contacts;

    @GetMapping("/categories")
    List<Category> categories() {
        return categories.findByActiveTrueOrderByNameAsc();
    }

    @GetMapping("/brands")
    List<Brand> brands() {
        return brands.findAll(org.springframework.data.domain.Sort.by("name"));
    }

    @GetMapping("/product-groups")
    List<ProductGroup> productGroups() {
        return productGroups.findAll(org.springframework.data.domain.Sort.by("name"));
    }

    @GetMapping("/needs")
    List<Need> needs() {
        return needs.findAll(org.springframework.data.domain.Sort.by("name"));
    }

    @GetMapping("/products")
    List<Product> products(@RequestParam(required = false) String category) {
        return category == null || category.isBlank()
                ? products.findByActiveTrueOrderByIdDesc()
                : products.findByCategorySlugAndActiveTrueOrderByIdDesc(category);
    }

    @GetMapping("/products/featured")
    List<Product> featured() {
        return products.findByFeaturedTrueAndActiveTrueOrderByIdDesc();
    }

    @GetMapping("/products/{slug}")
    Product product(@PathVariable String slug) {
        return products.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
    }

    @GetMapping("/posts")
    List<Post> posts() {
        return posts.findByActiveTrueOrderByCreatedAtDesc();
    }

    @GetMapping("/posts/{slug}")
    Post post(@PathVariable String slug) {
        return posts.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết"));
    }

    @GetMapping("/banners")
    List<Banner> banners() {
        return banners.findByActiveTrueOrderBySortOrderAscIdAsc();
    }

    @GetMapping("/settings")
    SiteSetting settings() {
        return settings.findById(1L).orElseGet(SiteSetting::new);
    }

    @PostMapping("/contacts")
    @ResponseStatus(HttpStatus.CREATED)
    ContactMessage contact(@Valid @RequestBody ContactRequest request) {
        return contacts.save(ContactMessage.builder()
                .name(request.name().trim())
                .phone(normalizePhone(request.phone()))
                .email(request.email() == null ? null : request.email().trim())
                .content(request.content().trim())
                .createdAt(LocalDateTime.now())
                .handled(false)
                .build());
    }

    private String normalizePhone(String value) {
        return value.replaceAll("[\\s.-]", "");
    }
}
