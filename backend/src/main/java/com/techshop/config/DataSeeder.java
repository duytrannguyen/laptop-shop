package com.techshop.config;

import com.techshop.entity.*;
import com.techshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {
    private final CategoryRepository categories;
    private final BrandRepository brands;
    private final ProductGroupRepository productGroups;
    private final NeedRepository needs;
    private final ProductRepository products;
    private final PostRepository posts;
    private final BannerRepository banners;
    private final SiteSettingRepository settings;
    private final MenuItemRepository menuItems;

    @Bean
    CommandLineRunner seed(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            // Drop old unused columns if they exist
            try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN title_old"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner DROP COLUMN badge"); } catch(Exception e) {}
            // Add new columns if not exist
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN sort_order INT DEFAULT 0"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN type VARCHAR(50) DEFAULT 'Hình ảnh'"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN position VARCHAR(20) DEFAULT 'SLIDER'"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN title VARCHAR(300)"); } catch(Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE banner ADD COLUMN background VARCHAR(500)"); } catch(Exception e) {}
            // Migrate old banners to SLIDER position
            try { jdbcTemplate.execute("UPDATE banner SET position='SLIDER' WHERE position IS NULL OR position=''"); } catch(Exception e) {}

            SiteSetting setting = settings.findById(1L).orElseGet(() -> SiteSetting.builder()
                    .id(1L)
                    .storeName("Tech Shop - Hệ thống bán lẻ sản phẩm công nghệ")
                    .shortName("Tech Shop")
                    .hotline("0816109179")
                    .email("contact@techshop.vn")
                    .address("Số 25, đường B25, KDC 91B, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ")
                    .openingHours("08:30 - 20:00 hàng ngày")
                    .build());
            settings.save(setting);

            if (menuItems.count() == 0) {
                // Main Menu
                menuItems.save(MenuItem.builder().label("Trang chủ").url("/").type("MENU").sortOrder(1).build());
                menuItems.save(MenuItem.builder().label("Sản phẩm").url("/products").type("MENU").sortOrder(2).build());
                menuItems.save(MenuItem.builder().label("Trả góp 0%").url("/installment").type("MENU").sortOrder(3).build());
                menuItems.save(MenuItem.builder().label("Bảo hành").url("/warranty").type("MENU").sortOrder(4).build());
                menuItems.save(MenuItem.builder().label("Liên hệ").url("/about").type("MENU").sortOrder(5).build());

                // Footer
                MenuItem footer1 = menuItems.save(MenuItem.builder().label("Về Tech Shop").url("#").type("FOOTER").sortOrder(1).build());
                menuItems.save(MenuItem.builder().label("Giới thiệu chung").url("/about").type("FOOTER").parentId(footer1.getId()).sortOrder(1).build());
                menuItems.save(MenuItem.builder().label("Tuyển dụng").url("/about").type("FOOTER").parentId(footer1.getId()).sortOrder(2).build());
                
                MenuItem footer2 = menuItems.save(MenuItem.builder().label("Hỗ trợ khách hàng").url("#").type("FOOTER").sortOrder(2).build());
                menuItems.save(MenuItem.builder().label("Chính sách bảo hành").url("/warranty").type("FOOTER").parentId(footer2.getId()).sortOrder(1).build());
                menuItems.save(MenuItem.builder().label("Hướng dẫn trả góp").url("/installment").type("FOOTER").parentId(footer2.getId()).sortOrder(2).build());
                menuItems.save(MenuItem.builder().label("Câu hỏi thường gặp").url("/faq").type("FOOTER").parentId(footer2.getId()).sortOrder(3).build());
            }

            if (categories.count() == 0) {
                Category phoneCat = categories.save(Category.builder().name("Điện thoại").slug("dien-thoai").active(true).build());
                Category headphoneCat = categories.save(Category.builder().name("Tai nghe").slug("tai-nghe").active(true).build());
                Category keyboardCat = categories.save(Category.builder().name("Bàn phím").slug("ban-phim").active(true).build());
                Category screenCat = categories.save(Category.builder().name("Màn hình").slug("man-hinh").active(true).build());

                Brand appleBrand = brands.save(Brand.builder().name("Apple").slug("apple").active(true).build());
                Brand samsungBrand = brands.save(Brand.builder().name("Samsung").slug("samsung").active(true).build());
                Brand logitechBrand = brands.save(Brand.builder().name("Logitech").slug("logitech").active(true).build());
                Brand sonyBrand = brands.save(Brand.builder().name("Sony").slug("sony").active(true).build());

                needs.save(Need.builder().name("Mới").slug("moi").active(true).build());
                needs.save(Need.builder().name("Đã sử dụng").slug("da-su-dung").active(true).build());

                products.save(Product.builder()
                        .name("iPhone 15 Pro Max 256GB")
                        .slug("iphone-15-pro-max-256gb").sku("IP15PM-256").brand(appleBrand)
                        .price(new BigDecimal("34990000")).salePrice(new BigDecimal("29990000"))
                        .image("https://images.unsplash.com/photo-1696446701796-da61225697cc?w=900")
                        .cpu("Apple A17 Pro").ram("8GB").ssd("256GB").screen("6.7 inch Super Retina XDR").vga("Apple GPU")
                        .battery("4422 mAh").weight("221g").stock(15).featured(true).active(true)
                        .description("Sản phẩm cao cấp nhất của Apple với khung Titanium, vi xử lý A17 Pro mạnh mẽ và camera 5x quang học.")
                        .createdAt(LocalDateTime.now()).category(phoneCat).build());
                products.save(Product.builder()
                        .name("Tai nghe Bluetooth Sony WH-1000XM5")
                        .slug("tai-nghe-bluetooth-sony-wh-1000xm5").sku("SONY-XM5").brand(sonyBrand)
                        .price(new BigDecimal("7990000")).salePrice(new BigDecimal("6990000"))
                        .image("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=900")
                        .cpu("-").ram("-").ssd("-").screen("-").vga("-")
                        .battery("30 giờ").weight("250g").stock(20).featured(true).active(true)
                        .description("Tai nghe chống ồn chủ động xuất sắc nhất, âm thanh hi-res và thời lượng pin cực khủng.")
                        .createdAt(LocalDateTime.now()).category(headphoneCat).build());
                products.save(Product.builder()
                        .name("Bàn phím cơ không dây Logitech MX Mechanical Mini")
                        .slug("ban-phim-co-khong-day-logitech-mx-mechanical-mini").sku("LOGI-MX-MECH").brand(logitechBrand)
                        .price(new BigDecimal("3990000")).salePrice(new BigDecimal("3590000"))
                        .image("https://images.unsplash.com/photo-1595225476474-87563907a212?w=900")
                        .cpu("-").ram("-").ssd("-").screen("-").vga("-")
                        .battery("15 ngày").weight("612g").stock(10).featured(true).active(true)
                        .description("Bàn phím cơ nhỏ gọn, gõ êm, kết nối đa thiết bị dễ dàng, thiết kế sang trọng cho dân văn phòng và coder.")
                        .createdAt(LocalDateTime.now()).category(keyboardCat).build());
            }

            if (posts.count() == 0) {
                posts.save(Post.builder()
                        .title("Kinh nghiệm chọn mua phụ kiện công nghệ")
                        .slug("kinh-nghiem-chon-mua-phu-kien-cong-nghe")
                        .image("https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900")
                        .content("Nên chọn cửa hàng có chế độ bảo hành rõ ràng, sản phẩm chính hãng và giá cả minh bạch.")
                        .createdAt(LocalDateTime.now()).active(true).build());
            }

            // Seed sidebar và strip banners nếu chưa có
            // Remove old sidebar & strip banners to re-insert new ones with images
            banners.deleteAll(banners.findByPositionOrderBySortOrderAscIdAsc("SIDEBAR"));
            banners.deleteAll(banners.findByPositionOrderBySortOrderAscIdAsc("STRIP"));

            banners.save(Banner.builder().position("SIDEBAR")
                    .title("Trả góp 0%").description("Sở hữu công nghệ dễ dàng")
                    .linkUrl("/installment")
                    .imageUrl("http://localhost:8080/uploads/sidebar_installment.png")
                    .active(true).sortOrder(1).build());
            banners.save(Banner.builder().position("SIDEBAR")
                    .title("Giao hàng siêu tốc").description("Miễn phí cho đơn từ 2 triệu")
                    .linkUrl("/products")
                    .imageUrl("http://localhost:8080/uploads/sidebar_shipping.png")
                    .active(true).sortOrder(2).build());

            banners.save(Banner.builder().position("STRIP")
                    .title("📱 Thu cũ đổi mới trợ giá cao").linkUrl("/products")
                    .imageUrl("http://localhost:8080/uploads/strip_tradein.png")
                    .active(true).sortOrder(1).build());
            banners.save(Banner.builder().position("STRIP")
                    .title("🎁 Tặng voucher quà tặng giá trị").linkUrl("/products")
                    .imageUrl("http://localhost:8080/uploads/strip_voucher.png")
                    .active(true).sortOrder(2).build());
            banners.save(Banner.builder().position("STRIP")
                    .title("🚚 Freeship tận nhà nhanh chóng").linkUrl("/products")
                    .imageUrl("http://localhost:8080/uploads/strip_delivery.png")
                    .active(true).sortOrder(3).build());
            banners.save(Banner.builder().position("STRIP")
                    .title("🎓 Ưu đãi cực khủng cho HSSV").linkUrl("/products")
                    .imageUrl("http://localhost:8080/uploads/strip_student.png")
                    .active(true).sortOrder(4).build());
            long sliderCount = banners.findByPositionOrderBySortOrderAscIdAsc("SLIDER").size();
            if (sliderCount == 0) {
                banners.save(Banner.builder().position("SLIDER")
                        .title("Khám phá iPhone 15 Series mới nhất")
                        .type("Hình ảnh")
                        .imageUrl("http://localhost:8080/uploads/banner_iphone.png")
                        .linkUrl("/products")
                        .active(true).sortOrder(1).build());
                banners.save(Banner.builder().position("SLIDER")
                        .title("Tai nghe chống ồn đỉnh cao")
                        .type("Hình ảnh")
                        .imageUrl("http://localhost:8080/uploads/banner_audio.png")
                        .linkUrl("/products")
                        .active(true).sortOrder(2).build());
                banners.save(Banner.builder().position("SLIDER")
                        .title("Góc làm việc hiện đại")
                        .type("Hình ảnh")
                        .imageUrl("http://localhost:8080/uploads/banner_accessories.png")
                        .linkUrl("/products")
                        .active(true).sortOrder(3).build());
            }
        };
    }
}
