package com.techshop.controller;

import com.techshop.dto.*;
import com.techshop.entity.*;
import com.techshop.repository.*;
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
    private final MenuItemRepository menuItems;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @org.springframework.beans.factory.annotation.Value("${app.upload-dir}")
    private String uploadDirStr;

    private void deleteImageFile(String url) {
        if (url == null || url.isBlank() || !url.startsWith("/uploads/")) return;
        try {
            java.nio.file.Path uploadDir = java.nio.file.Path.of(uploadDirStr).toAbsolutePath().normalize();
            String relativePath = url.substring("/uploads/".length());
            java.nio.file.Path targetPath = uploadDir.resolve(relativePath).normalize();
            if (targetPath.startsWith(uploadDir) && java.nio.file.Files.exists(targetPath)) {
                java.nio.file.Files.delete(targetPath);
            }
        } catch (Exception e) {
            // Ignore
        }
    }

    @GetMapping("/fix-db")
    public String fixDb() {
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN brand VARCHAR(100) NULL"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN `condition` VARCHAR(255) NULL"); } catch(Exception e) {}
        try { jdbcTemplate.execute("INSERT IGNORE INTO product_need (product_id, need_id) SELECT id, need_id FROM product WHERE need_id IS NOT NULL"); } catch(Exception e) { System.out.println("Migrate product_need skip: " + e.getMessage()); }
        try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN title"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN badge"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN background"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN sort_order"); } catch(Exception e) {}
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
        Product product = products.findById(id).orElseThrow(() -> notFound("Không tìm thấy sản phẩm"));
        deleteImageFile(product.getImage());
        deleteImageFile(product.getMetaImage());
        if (product.getGallery() != null && !product.getGallery().isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.List<String> urls = mapper.readValue(product.getGallery(), new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {});
                if (urls != null) {
                    for (String u : urls) deleteImageFile(u);
                }
            } catch (Exception e) {}
        }
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
        return categories.findAllByOrderBySortOrderAscNameAsc();
    }

    @GetMapping("/categories/tree")
    List<Category> categoriesTree() {
        return categories.findRootCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    Category createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name().trim());
        category.setSlug(request.slug().trim());
        category.setImage(request.image() == null || request.image().isBlank() ? null : request.image().trim());
        category.setActive(request.active());
        // Lưu trước để có ID
        category = categories.save(category);
        // Gán danh mục cha sau khi có ID
        if (request.parentIds() != null && !request.parentIds().isEmpty()) {
            java.util.Set<Category> parentSet = new java.util.HashSet<>(categories.findAllById(request.parentIds()));
            final Long catId = category.getId();
            parentSet.removeIf(p -> p.getId().equals(catId));
            category.setParents(parentSet);
            category = categories.save(category);
        }
        return category;
    }

    @PutMapping("/categories/{id}")
    @Transactional
    Category updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        Category category = categories.findById(id).orElseThrow(() -> notFound("Không tìm thấy danh mục"));
        applyCategory(category, request);
        return categories.save(category);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteCategory(@PathVariable Long id) {
        Category category = categories.findById(id).orElseThrow(() -> notFound("Không tìm thấy danh mục"));
        if (products.countByCategoryId(id) > 0) {
            throw new IllegalArgumentException("Không thể xóa danh mục đang có sản phẩm");
        }
        if (!category.getChildren().isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa danh mục đang có danh mục con");
        }
        // Xóa quan hệ cha trước khi xóa
        category.getParents().clear();
        categories.save(category);
        deleteImageFile(category.getImage());
        categories.deleteById(id);
    }

    /** Lưu thứ tự kéo thả: nhận list [{id, sortOrder, parentId?}]
     *  parentId = null → danh mục gốc; parentId = Long → danh mục con */
    @PutMapping("/categories/reorder")
    @Transactional
    List<Category> reorderCategories(@RequestBody List<Map<String, Object>> items) {
        // Bước 1: Cập nhật sortOrder và parent cho từng item
        for (Map<String, Object> entry : items) {
            Long id = Long.valueOf(entry.get("id").toString());
            Integer sortOrder = entry.get("sortOrder") != null ? Integer.valueOf(entry.get("sortOrder").toString()) : 0;
            Long parentId = entry.get("parentId") != null ? Long.valueOf(entry.get("parentId").toString()) : null;

            categories.findById(id).ifPresent(cat -> {
                cat.setSortOrder(sortOrder);
                // Cập nhật quan hệ cha
                cat.getParents().clear();
                if (parentId != null) {
                    categories.findById(parentId).ifPresent(parent -> {
                        if (!parent.getId().equals(cat.getId())) { // tránh tự làm cha của mình
                            cat.getParents().add(parent);
                        }
                    });
                }
                categories.save(cat);
            });
        }
        return categories.findAllByOrderBySortOrderAscNameAsc();
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
        Brand brand = brands.findById(id).orElseThrow(() -> notFound("Không tìm thấy thương hiệu"));
        deleteImageFile(brand.getImage());
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
        ProductGroup group = productGroups.findById(id).orElseThrow(() -> notFound("Không tìm thấy nhóm sản phẩm"));
        deleteImageFile(group.getImage());
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
        Need need = needs.findById(id).orElseThrow(() -> notFound("Không tìm thấy nhu cầu"));
        deleteImageFile(need.getImage());
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
        Post post = posts.findById(id).orElseThrow(() -> notFound("Không tìm thấy bài viết"));
        deleteImageFile(post.getImage());
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
    List<Banner> banners(@RequestParam(required = false) String position) {
        if (position != null && !position.isBlank()) {
            return banners.findByPositionOrderBySortOrderAscIdAsc(position.toUpperCase(Locale.ROOT));
        }
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
        Banner banner = banners.findById(id).orElseThrow(() -> notFound("Không tìm thấy banner"));
        deleteImageFile(banner.getImageUrl());
        banners.deleteById(id);
    }

    @PutMapping("/banners/reorder")
    @jakarta.transaction.Transactional
    List<Banner> reorderBanners(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> entry : items) {
            Long id = Long.valueOf(entry.get("id").toString());
            Integer sortOrder = Integer.valueOf(entry.get("sortOrder").toString());
            banners.findById(id).ifPresent(banner -> {
                banner.setSortOrder(sortOrder);
                banners.save(banner);
            });
        }
        return banners.findAllByOrderBySortOrderAscIdAsc();
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

    // --- MENU ITEMS (Menu & Footer) ---
    @GetMapping("/menu-items")
    List<MenuItem> menuItems(@RequestParam String type) {
        return menuItems.findByTypeOrderBySortOrderAsc(type.toUpperCase(Locale.ROOT));
    }

    @PostMapping("/menu-items")
    @ResponseStatus(HttpStatus.CREATED)
    MenuItem createMenuItem(@RequestBody MenuItem item) {
        item.setId(null);
        if (item.getSortOrder() == null) item.setSortOrder(0);
        if (item.getType() != null) item.setType(item.getType().toUpperCase(Locale.ROOT));
        return menuItems.save(item);
    }

    @PutMapping("/menu-items/{id}")
    MenuItem updateMenuItem(@PathVariable Long id, @RequestBody MenuItem request) {
        MenuItem item = menuItems.findById(id).orElseThrow(() -> notFound("Không tìm thấy mục"));
        item.setLabel(request.getLabel());
        item.setUrl(request.getUrl());
        if (request.getParentId() != null) item.setParentId(request.getParentId());
        if (request.getSortOrder() != null) item.setSortOrder(request.getSortOrder());
        return menuItems.save(item);
    }

    @DeleteMapping("/menu-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteMenuItem(@PathVariable Long id) {
        if (!menuItems.existsById(id)) throw notFound("Không tìm thấy mục");
        // Also delete children
        menuItems.deleteByParentId(id);
        menuItems.deleteById(id);
    }

    @PutMapping("/menu-items/reorder")
    @Transactional
    List<MenuItem> reorderMenuItems(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> entry : items) {
            Long id = Long.valueOf(entry.get("id").toString());
            Integer sortOrder = Integer.valueOf(entry.get("sortOrder").toString());
            Long parentId = entry.get("parentId") != null ? Long.valueOf(entry.get("parentId").toString()) : null;
            menuItems.findById(id).ifPresent(item -> {
                item.setSortOrder(sortOrder);
                item.setParentId(parentId);
                menuItems.save(item);
            });
        }
        String type = items.isEmpty() ? "MENU" : menuItems.findById(Long.valueOf(items.get(0).get("id").toString()))
                .map(MenuItem::getType).orElse("MENU");
        return menuItems.findByTypeOrderBySortOrderAsc(type);
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

    private void applyCategory(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
        category.setSlug(request.slug().trim());
        category.setImage(blankToNull(request.image()));
        category.setActive(request.active());
        // Xử lý quan hệ cha: xóa cha cũ rồi gán cha mới
        category.getParents().clear();
        if (request.parentIds() != null && !request.parentIds().isEmpty()) {
            java.util.Set<Category> parentSet = new java.util.HashSet<>(categories.findAllById(request.parentIds()));
            // Ngăn vòng tham chiếu: không cho category làm cha của chính nó
            if (category.getId() != null) parentSet.removeIf(p -> p.getId().equals(category.getId()));
            category.setParents(parentSet);
        }
    }

    private void applyBanner(Banner banner, BannerRequest request) {
        if (request.position() != null && !request.position().isBlank())
            banner.setPosition(request.position().toUpperCase(Locale.ROOT));
        banner.setTitle(blankToNull(request.title()));
        banner.setDescription(blankToNull(request.description()));
        banner.setImageUrl(blankToNull(request.imageUrl()));
        banner.setBackground(blankToNull(request.background()));
        banner.setLinkUrl(blankToNull(request.linkUrl()));
        banner.setActive(request.active());
        if (request.sortOrder() != null) banner.setSortOrder(request.sortOrder());
        if (request.type() != null && !request.type().isBlank()) banner.setType(request.type());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
