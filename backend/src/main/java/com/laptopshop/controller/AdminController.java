package com.laptopshop.controller;

import com.laptopshop.dto.*;
import com.laptopshop.entity.*;
import com.laptopshop.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private static final Set<String> ORDER_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "SHIPPING", "DONE", "CANCELLED");

    private final CategoryRepository categories;
    private final BrandRepository brands;
    private final ProductGroupRepository productGroups;
    private final NeedRepository needs;
    private final ProductRepository products;
    private final PostRepository posts;
    private final OrderRepository orders;
    private final BannerRepository banners;
    private final SiteSettingRepository settings;
    private final ContactMessageRepository contacts;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    public String fixDb() {
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN brand VARCHAR(100) NULL"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN `condition` VARCHAR(255) NULL"); } catch(Exception e) {}
        try { jdbcTemplate.execute("INSERT IGNORE INTO product_need (product_id, need_id) SELECT id, need_id FROM product WHERE need_id IS NOT NULL"); } catch(Exception e) { System.out.println("Migrate product_need skip: " + e.getMessage()); }
        return "DB Fixed";
    }

    @GetMapping("/stats")
    Map<String, Object> stats() {
        return Map.of(
                "totalProducts", products.count(),
                "totalCategories", categories.count(),
                "totalPosts", posts.count(),
                "totalOrders", orders.count(),
                "totalBanners", banners.count(),
                "pendingContacts", contacts.countByHandledFalse());
    }

    @GetMapping("/products")
    List<Product> products() {
        return products.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    Product createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = new Product();
        product.setCreatedAt(java.time.LocalDate.now().atStartOfDay());
        applyProduct(product, request);
        return products.save(product);
    }

    @PutMapping("/products/{id}")
    Product updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product product = product(id);
        applyProduct(product, request);
        return products.save(product);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteProduct(@PathVariable Long id) {
        if (!products.existsById(id)) throw notFound("Không tìm thấy sản phẩm");
        products.deleteById(id);
    }

    @PatchMapping("/products/{id}/quick-update")
    Product quickUpdateProduct(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Product product = products.findById(id).orElseThrow(() -> notFound("Không tìm thấy sản phẩm"));
        if (updates.containsKey("featured")) {
            product.setFeatured((Boolean) updates.get("featured"));
        }
        if (updates.containsKey("active")) {
            product.setActive((Boolean) updates.get("active"));
        }
        if (updates.containsKey("outOfStock")) {
            boolean outOfStock = (Boolean) updates.get("outOfStock");
            product.setStock(outOfStock ? 0 : 10);
        }
        if (updates.containsKey("createdAt")) {
            String dateStr = (String) updates.get("createdAt");
            try {
                product.setCreatedAt(java.time.LocalDate.parse(dateStr).atStartOfDay());
            } catch (Exception e) {}
        }
        return products.save(product);
    }

    @GetMapping("/categories")
    List<Category> categories() {
        return categories.findAll(Sort.by("name"));
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    Category createCategory(@Valid @RequestBody Category category) {
        category.setId(null);
        return categories.save(category);
    }

    @PutMapping("/categories/{id}")
    Category updateCategory(@PathVariable Long id, @Valid @RequestBody Category request) {
        Category category = categories.findById(id).orElseThrow(() -> notFound("Không tìm thấy danh mục"));
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setImage(request.getImage());
        category.setActive(request.isActive());
        return categories.save(category);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteCategory(@PathVariable Long id) {
        if (!categories.existsById(id)) throw notFound("Không tìm thấy danh mục");
        if (products.countByCategoryId(id) > 0) {
            throw new IllegalArgumentException("Không thể xóa danh mục đang có sản phẩm");
        }
        categories.deleteById(id);
    }

    // --- BRANDS ---
    @GetMapping("/brands")
    List<Brand> brands() {
        return brands.findAll(Sort.by("name"));
    }

    @PostMapping("/brands")
    @ResponseStatus(HttpStatus.CREATED)
    Brand createBrand(@Valid @RequestBody Brand brand) {
        brand.setId(null);
        return brands.save(brand);
    }

    @PutMapping("/brands/{id}")
    Brand updateBrand(@PathVariable Long id, @Valid @RequestBody Brand request) {
        Brand brand = brands.findById(id).orElseThrow(() -> notFound("Không tìm thấy thương hiệu"));
        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setImage(request.getImage());
        brand.setActive(request.isActive());
        return brands.save(brand);
    }

    @DeleteMapping("/brands/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteBrand(@PathVariable Long id) {
        if (!brands.existsById(id)) throw notFound("Không tìm thấy thương hiệu");
        brands.deleteById(id);
    }

    // --- PRODUCT GROUPS ---
    @GetMapping("/product-groups")
    List<ProductGroup> productGroups() {
        return productGroups.findAll(Sort.by("name"));
    }

    @PostMapping("/product-groups")
    @ResponseStatus(HttpStatus.CREATED)
    ProductGroup createProductGroup(@Valid @RequestBody ProductGroup group) {
        group.setId(null);
        return productGroups.save(group);
    }

    @PutMapping("/product-groups/{id}")
    ProductGroup updateProductGroup(@PathVariable Long id, @Valid @RequestBody ProductGroup request) {
        ProductGroup group = productGroups.findById(id).orElseThrow(() -> notFound("Không tìm thấy nhóm sản phẩm"));
        group.setName(request.getName());
        group.setSlug(request.getSlug());
        group.setImage(request.getImage());
        group.setActive(request.isActive());
        return productGroups.save(group);
    }

    @DeleteMapping("/product-groups/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteProductGroup(@PathVariable Long id) {
        if (!productGroups.existsById(id)) throw notFound("Không tìm thấy nhóm sản phẩm");
        productGroups.deleteById(id);
    }

    // --- NEEDS ---
    @GetMapping("/needs")
    List<Need> needs() {
        return needs.findAll(Sort.by("name"));
    }

    @PostMapping("/needs")
    @ResponseStatus(HttpStatus.CREATED)
    Need createNeed(@Valid @RequestBody Need need) {
        need.setId(null);
        return needs.save(need);
    }

    @PutMapping("/needs/{id}")
    Need updateNeed(@PathVariable Long id, @Valid @RequestBody Need request) {
        Need need = needs.findById(id).orElseThrow(() -> notFound("Không tìm thấy nhu cầu"));
        need.setName(request.getName());
        need.setSlug(request.getSlug());
        need.setImage(request.getImage());
        need.setActive(request.isActive());
        return needs.save(need);
    }

    @DeleteMapping("/needs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteNeed(@PathVariable Long id) {
        if (!needs.existsById(id)) throw notFound("Không tìm thấy nhu cầu");
        needs.deleteById(id);
    }

    @GetMapping("/posts")
    List<Post> posts() {
        return posts.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    Post createPost(@Valid @RequestBody Post post) {
        post.setId(null);
        post.setCreatedAt(LocalDateTime.now());
        return posts.save(post);
    }

    @PutMapping("/posts/{id}")
    Post updatePost(@PathVariable Long id, @Valid @RequestBody Post request) {
        Post post = posts.findById(id).orElseThrow(() -> notFound("Không tìm thấy bài viết"));
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug());
        post.setImage(request.getImage());
        post.setContent(request.getContent());
        post.setActive(request.isActive());
        return posts.save(post);
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deletePost(@PathVariable Long id) {
        if (!posts.existsById(id)) throw notFound("Không tìm thấy bài viết");
        posts.deleteById(id);
    }

    @GetMapping("/orders")
    List<Order> orders() {
        return orders.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/orders/{id}/status")
    @Transactional
    Order updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "").toUpperCase(Locale.ROOT);
        if (!ORDER_STATUSES.contains(status)) throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ");
        Order order = orders.findWithItemsById(id).orElseThrow(() -> notFound("Không tìm thấy đơn hàng"));
        if ("CANCELLED".equals(order.getStatus()) && !"CANCELLED".equals(status)) {
            throw new IllegalArgumentException("Không thể mở lại đơn hàng đã hủy");
        }
        if (!"CANCELLED".equals(order.getStatus()) && "CANCELLED".equals(status)) {
            for (OrderItem item : order.getItems()) {
                products.findById(item.getProductId()).ifPresent(product ->
                        product.setStock((product.getStock() == null ? 0 : product.getStock()) + item.getQuantity()));
            }
        }
        order.setStatus(status);
        return orders.save(order);
    }

    @GetMapping("/banners")
    List<Banner> banners() {
        return banners.findAllByOrderBySortOrderAscIdAsc();
    }

    @PostMapping("/banners")
    @ResponseStatus(HttpStatus.CREATED)
    Banner createBanner(@Valid @RequestBody BannerRequest request) {
        Banner banner = new Banner();
        applyBanner(banner, request);
        return banners.save(banner);
    }

    @PutMapping("/banners/{id}")
    Banner updateBanner(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        Banner banner = banners.findById(id).orElseThrow(() -> notFound("Không tìm thấy banner"));
        applyBanner(banner, request);
        return banners.save(banner);
    }

    @DeleteMapping("/banners/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteBanner(@PathVariable Long id) {
        if (!banners.existsById(id)) throw notFound("Không tìm thấy banner");
        banners.deleteById(id);
    }

    @GetMapping("/settings")
    SiteSetting settings() {
        return settings.findById(1L).orElseGet(() -> SiteSetting.builder().id(1L).build());
    }

    @PutMapping("/settings")
    SiteSetting updateSettings(@RequestBody SiteSetting request) {
        request.setId(1L);
        return settings.save(request);
    }

    @GetMapping("/contacts")
    List<ContactMessage> contacts() {
        return contacts.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/contacts/{id}/handled")
    ContactMessage updateContact(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        ContactMessage message = contacts.findById(id).orElseThrow(() -> notFound("Không tìm thấy tin nhắn"));
        message.setHandled(body.getOrDefault("handled", true));
        return contacts.save(message);
    }

    @DeleteMapping("/contacts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteContact(@PathVariable Long id) {
        if (!contacts.existsById(id)) throw notFound("Không tìm thấy tin nhắn");
        contacts.deleteById(id);
    }

    private Product product(Long id) {
        return products.findById(id).orElseThrow(() -> notFound("Không tìm thấy sản phẩm"));
    }

    private void applyProduct(Product product, ProductRequest request) {
        if (request.salePrice() != null && request.salePrice().signum() > 0
                && request.price() != null && request.salePrice().compareTo(request.price()) > 0) {
            throw new IllegalArgumentException("Giá bán không được lớn hơn giá gốc");
        }
        product.setName(request.name().trim());
        product.setSlug(request.slug().trim());
        product.setSku(blankToNull(request.sku()));
        product.setPrice(request.price());
        product.setSalePrice(request.salePrice() == null || request.salePrice().signum() == 0 ? null : request.salePrice());
        product.setImage(blankToNull(request.image()));
        product.setGallery(blankToNull(request.gallery()));
        product.setCpu(blankToNull(request.cpu()));
        product.setRam(blankToNull(request.ram()));
        product.setSsd(blankToNull(request.ssd()));
        product.setScreen(blankToNull(request.screen()));
        product.setVga(blankToNull(request.vga()));
        product.setBattery(blankToNull(request.battery()));
        product.setWeight(blankToNull(request.weight()));
        product.setStock(request.stock() == null ? 0 : request.stock());
        product.setFeatured(request.featured());
        product.setActive(request.active());
        product.setDescription(request.description());
        product.setContent(request.content());
        product.setPromotion(request.promotion());
        product.setSpecs(request.specs());
        product.setMetaTitle(blankToNull(request.metaTitle()));
        product.setMetaDescription(blankToNull(request.metaDescription()));
        product.setMetaImage(blankToNull(request.metaImage()));

        product.setBrand(request.brandId() == null ? null : brands.findById(request.brandId())
                .orElseThrow(() -> notFound("Không tìm thấy thương hiệu")));
        product.setProductGroup(request.productGroupId() == null ? null : productGroups.findById(request.productGroupId())
                .orElseThrow(() -> notFound("Không tìm thấy nhóm sản phẩm")));
        if (request.needIds() != null && !request.needIds().isEmpty()) {
            product.setNeeds(new java.util.HashSet<>(needs.findAllById(request.needIds())));
        } else {
            product.setNeeds(new java.util.HashSet<>());
        }
        product.setCategory(request.categoryId() == null ? null : categories.findById(request.categoryId())
                .orElseThrow(() -> notFound("Không tìm thấy danh mục")));
    }

    private void applyBanner(Banner banner, BannerRequest request) {
        banner.setTitle(request.title().trim());
        banner.setDescription(request.description());
        banner.setBadge(request.badge());
        banner.setImageUrl(blankToNull(request.imageUrl()));
        banner.setLinkUrl(blankToNull(request.linkUrl()));
        banner.setBackground(blankToNull(request.background()));
        banner.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        banner.setActive(request.active());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
