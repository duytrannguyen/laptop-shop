package com.laptopshop.config;

import com.laptopshop.entity.*;
import com.laptopshop.repository.*;
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

    @Bean
    CommandLineRunner seed() {
        return args -> {
            SiteSetting setting = settings.findById(1L).orElseGet(() -> SiteSetting.builder()
                    .id(1L)
                    .storeName("Laptop Shop - Laptop cũ Cần Thơ")
                    .shortName("Laptop Shop")
                    .hotline("0816109179")
                    .email("contact@laptopshop.vn")
                    .address("Số 25, đường B25, KDC 91B, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ")
                    .openingHours("08:30 - 20:00 hàng ngày")
                    .build());
            settings.save(setting);

            if (categories.count() == 0) {
                Category dellCat = categories.save(Category.builder().name("Laptop Dell").slug("laptop-dell").active(true).build());
                Category hpCat = categories.save(Category.builder().name("Laptop HP").slug("laptop-hp").active(true).build());
                Category asusCat = categories.save(Category.builder().name("Laptop ASUS").slug("laptop-asus").active(true).build());

                Brand appleBrand = brands.save(Brand.builder().name("Apple").slug("apple").active(true).build());
                Brand asusBrand = brands.save(Brand.builder().name("ASUS").slug("asus").active(true).build());
                Brand dellBrand = brands.save(Brand.builder().name("Dell").slug("dell").active(true).build());

                Need newNeed = needs.save(Need.builder().name("Mới").slug("moi").active(true).build());
                Need usedNeed = needs.save(Need.builder().name("Đã sử dụng").slug("da-su-dung").active(true).build());

                products.save(Product.builder()
                        .name("MacBook Air M1 2020 / RAM 8GB / SSD 256GB")
                        .slug("macbook-air-m1-2020")
                        .sku("MBA-M1-256")
                        .brand(appleBrand)
                        .need(usedNeed)
                        .price(new BigDecimal("11900000"))
                        .salePrice(new BigDecimal("10900000"))
                        .image("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900")
                        .cpu("Apple M1").ram("8GB").ssd("256GB").screen("13.3 Retina 2K").vga("Apple GPU 7-core")
                        .battery("49.9Wh").weight("1.29kg").stock(5).featured(true).active(true)
                        .description("Máy mỏng nhẹ, pin tốt, phù hợp văn phòng, học tập và thiết kế cơ bản.")
                        .createdAt(LocalDateTime.now()).category(hpCat).build());
                products.save(Product.builder()
                        .name("Laptop ASUS TUF Gaming F15 i7 / RAM 16GB / RTX3050")
                        .slug("asus-tuf-gaming-f15-i7-rtx3050")
                        .sku("ASUS-TUF-F15")
                        .brand(asusBrand).need(usedNeed)
                        .price(new BigDecimal("17600000")).salePrice(new BigDecimal("16900000"))
                        .image("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=900")
                        .cpu("Intel Core i7-12700H").ram("16GB DDR4").ssd("512GB NVMe").screen("15.6 FHD 144Hz")
                        .vga("RTX 3050 4GB").battery("56Wh").weight("2.2kg").stock(8).featured(true).active(true)
                        .description("Laptop gaming hiệu năng mạnh, màn hình tần số quét cao, phù hợp game và đồ họa.")
                        .createdAt(LocalDateTime.now()).category(asusCat).build());
                products.save(Product.builder()
                        .name("Dell Inspiron 15 3530 i5 / RAM 16GB / SSD 512GB")
                        .slug("dell-inspiron-15-3530-i5")
                        .sku("DELL-INS-3530")
                        .brand(dellBrand).need(newNeed)
                        .price(new BigDecimal("12500000"))
                        .image("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900")
                        .cpu("Intel Core i5-1334U").ram("16GB DDR4").ssd("512GB NVMe").screen("15.6 FHD")
                        .vga("Intel Iris Xe").battery("41Wh").weight("1.62kg").stock(6).featured(true).active(true)
                        .description("Máy văn phòng mới, thiết kế đơn giản, hiệu năng ổn định.")
                        .createdAt(LocalDateTime.now()).category(dellCat).build());
            }

            if (posts.count() == 0) {
                posts.save(Post.builder()
                        .title("Kinh nghiệm chọn laptop cũ Cần Thơ")
                        .slug("kinh-nghiem-chon-laptop-cu-can-tho")
                        .image("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900")
                        .content("Nên chọn cửa hàng có bảo hành rõ ràng, máy kiểm định kỹ, giá minh bạch và hỗ trợ sau bán hàng.")
                        .createdAt(LocalDateTime.now()).active(true).build());
            }

            if (banners.count() == 0) {
                banners.save(Banner.builder().badge("Laptop Shop")
                        .title("Laptop cũ Cần Thơ - Chất lượng, uy tín, giá minh bạch")
                        .description("Đa dạng laptop Gaming, Macbook và laptop văn phòng chính hãng, kiểm định kỹ, bảo hành rõ ràng.")
                        .linkUrl("/products").background("linear-gradient(135deg, #8b0010 0%, #d00016 55%, #ff4757 100%)")
                        .sortOrder(1).active(true).build());
                banners.save(Banner.builder().badge("KHUYẾN MÃI")
                        .title("Trả góp 0% - Sở hữu laptop chỉ từ 500K/tháng")
                        .description("Hỗ trợ trả góp qua thẻ tín dụng và công ty tài chính. Thủ tục nhanh gọn.")
                        .linkUrl("/installment").background("linear-gradient(135deg, #172554 0%, #2563eb 55%, #60a5fa 100%)")
                        .sortOrder(2).active(true).build());
                banners.save(Banner.builder().badge("THU CŨ ĐỔI MỚI")
                        .title("Mang máy cũ - Nhận giá cao, đổi máy mới ngay")
                        .description("Định giá minh bạch, trả tiền ngay hoặc khấu trừ khi mua máy mới.")
                        .linkUrl("/contact").background("linear-gradient(135deg, #064e3b 0%, #059669 55%, #34d399 100%)")
                        .sortOrder(3).active(true).build());
            }
        };
    }
}
