package com.techshop.controller;

import com.techshop.dto.ContactRequest;
import com.techshop.entity.*;
import com.techshop.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Controller công khai – các API không yêu cầu đăng nhập, phục vụ giao diện khách hàng.
 *
 * Bao gồm:
 * - Danh mục, thương hiệu, nhom sản phẩm, nhu cầu
 * - Danh sách và chi tiết sản phẩm (lọc theo danh mục, featured)
 * - Bài viết/Trang nội dung
 * - Banner theo vị trí (SLIDER, SIDEBAR, STRIP)
 * - Cài đặt website (dung cho Header, Footer, SEO)
 * - Menu/Footer items
 * - Gửi tin nhắn liên hệ
 *
 * [DEBUG - chỉ dùng khi phát triển]
 * - GET /api/fix-db: sửa cấu trúc cột database (gọi 1 lần khi cần)
 * - GET /api/seed-real: điền nội dung mẫu cho các trang tĩnh (FAQ, About, Warranty, Installment)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicController {
    private final CategoryRepository categories;
    private final BrandRepository brands;
    private final ProductGroupRepository productGroups;
    private final NeedRepository needs;

    private final ProductRepository products;
    private final PostRepository posts;
    private final BannerRepository banners;
    private final SiteSettingRepository settings;
    private final ContactMessageRepository contacts;
    private final MenuItemRepository menuItemRepo;

    @GetMapping("/categories")
    List<Category> categories() {
        // Trả về cây danh mục: danh mục gốc kèm children
        return categories.findActiveRootCategories();
    }

    @GetMapping("/categories/all")
    List<Category> categoriesAll() {
        // Trả về tất cả danh mục (flat list) cho trường hợp cần filter
        return categories.findByActiveTrueOrderBySortOrderAscNameAsc();
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
    List<Post> posts(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return posts.findByTypeAndActiveTrueOrderByCreatedAtDesc(type.toUpperCase(Locale.ROOT));
        }
        return posts.findByActiveTrueOrderByCreatedAtDesc();
    }

    @GetMapping("/posts/{slug}")
    Post post(@PathVariable String slug) {
        return posts.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết"));
    }

    @GetMapping("/banners")
    List<Banner> banners(@RequestParam(required = false, defaultValue = "SLIDER") String position) {
        return banners.findByPositionAndActiveTrueOrderBySortOrderAscIdAsc(position.toUpperCase(java.util.Locale.ROOT));
    }

    @GetMapping("/banners/all")
    java.util.Map<String, List<Banner>> allBanners() {
        return java.util.Map.of(
            "slider",  banners.findByPositionAndActiveTrueOrderBySortOrderAscIdAsc("SLIDER"),
            "sidebar", banners.findByPositionAndActiveTrueOrderBySortOrderAscIdAsc("SIDEBAR"),
            "strip",   banners.findByPositionAndActiveTrueOrderBySortOrderAscIdAsc("STRIP")
        );
    }

    @GetMapping("/menu-items")
    java.util.List<com.techshop.entity.MenuItem> publicMenuItems(@RequestParam String type) {
        return menuItemRepo.findByTypeOrderBySortOrderAsc(type.toUpperCase(java.util.Locale.ROOT));
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

    /** Chuẩn hóa số điện thoại: xóa khoảng trắng, dấu chấm, dấu gạch ngang. */
    private String normalizePhone(String value) {
        return value.replaceAll("[\\s.-]", "");
    }
}
