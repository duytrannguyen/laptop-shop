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
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    /** [DEBUG] Migration thủ công một số cột của bảng product (chỉ gọi khi cần, gọi lại nhiều lần không ảnh hưởng). */
    @GetMapping("/fix-db")
    public String fixDb() {
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN brand VARCHAR(100) NULL"); } catch(Exception e) {}
        try { jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN `condition` VARCHAR(255) NULL"); } catch(Exception e) {}
        return "DB Fixed";
    }

    /**
     * [DEBUG] Cập nhật nội dung HTML mẫu cho các trang tĩnh (FAQ, Giới thiệu, Bảo hành, Trả góp).
     * Gọi 1 lần dọng chạy lần đầu hoặc khi cần reset nội dung mẫu.
     */
    @GetMapping("/seed-real")
    public String seedReal() {
        String faqHtml = "<h2>Mua hàng</h2><p><strong>Làm sao để đặt hàng tại Tech Shop?</strong><br/>Bạn có thể đặt hàng trực tiếp trên website, gọi hotline, hoặc đến trực tiếp cửa hàng tại Số 25, đường B25, KDC 91B, Cần Thơ. Khi đặt online, bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và điền thông tin giao hàng.</p><p><strong>Tech Shop có giao hàng toàn quốc không?</strong><br/>Có! Tech Shop giao hàng toàn quốc qua các đơn vị vận chuyển uy tín. Miễn phí giao hàng cho đơn hàng thiết bị. Sản phẩm được đóng gói cẩn thận, chống sốc để đảm bảo an toàn khi vận chuyển.</p><p><strong>Tôi có thể xem máy trực tiếp trước khi mua không?</strong><br/>Hoàn toàn có thể! Bạn được xem máy, kiểm tra trực tiếp tại cửa hàng trước khi quyết định mua. Đội ngũ kỹ thuật sẽ hỗ trợ bạn kiểm tra mọi chức năng của máy.</p><p><strong>Tech Shop có nhận thanh toán chuyển khoản không?</strong><br/>Có, Tech Shop chấp nhận thanh toán tiền mặt, chuyển khoản ngân hàng, và các ví điện tử phổ biến.</p><h2>Bảo hành</h2><p><strong>Thiết bị công nghệ có được bảo hành không?</strong><br/>Tất cả sản phẩm tại Tech Shop đều được bảo hành từ 3-12 tháng tùy dòng máy. Bảo hành phần cứng bao gồm: mainboard, CPU, RAM, ổ cứng, màn hình, bàn phím, touchpad.</p><p><strong>Quy trình bảo hành như thế nào?</strong><br/>Khi cần bảo hành, bạn liên hệ hotline hoặc mang máy đến cửa hàng. Kỹ thuật viên sẽ kiểm tra và xử lý trong 1-3 ngày làm việc. Nếu ở xa, Tech Shop hỗ trợ ship 2 chiều.</p><p><strong>Pin thiết bị có được bảo hành không?</strong><br/>Pin thiết bị được bảo hành 3 tháng với điều kiện sức khỏe pin trên 80% tại thời điểm mua. Hao mòn pin tự nhiên do sử dụng không nằm trong phạm vi bảo hành.</p><h2>Vận chuyển</h2><p><strong>Thời gian giao hàng là bao lâu?</strong><br/>Nội ô Cần Thơ: Giao nhanh trong 2H.<br/>Các tỉnh miền Tây: 1-2 ngày làm việc.<br/>Các tỉnh thành khác: 2-4 ngày làm việc.</p><p><strong>Phí vận chuyển bao nhiêu?</strong><br/>Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng thiết bị. Sản phẩm được đóng hộp carton, bọc xốp chống sốc kỹ lưỡng.</p>";
        String aboutHtml = "<div style=\"text-align: center; margin-bottom: 20px;\"><h2>Tech Shop – Thiết bị số Cần Thơ</h2><p>Tech Shop được thành lập với sứ mệnh mang đến cho khách hàng tại Cần Thơ và khu vực Đồng bằng sông Cửu Long những thiết bị chất lượng với mức giá hợp lý nhất. Mỗi sản phẩm tại Tech Shop đều được kiểm tra kỹ lưỡng bởi đội ngũ kỹ thuật viên giàu kinh nghiệm trước khi đến tay khách hàng.</p></div><h3>Giá trị cốt lõi</h3><ul><li><strong>Chất lượng hàng đầu:</strong> Chỉ cung cấp sản phẩm chính hãng, nguyên bản, chưa qua sửa chữa.</li><li><strong>Uy tín tuyệt đối:</strong> Bảo hành minh bạch, 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng.</li><li><strong>Tận tâm phục vụ:</strong> Tư vấn nhiệt tình, hỗ trợ kỹ thuật trọn đời máy.</li></ul><h3>Tại sao chọn Tech Shop?</h3><ul><li><strong>Sản phẩm đa dạng:</strong> Từ thiết bị văn phòng, thiết bị gaming đến các dòng máy trạm đồ họa chuyên nghiệp.</li><li><strong>Mức giá cạnh tranh:</strong> Cam kết mang đến mức giá tốt nhất thị trường cùng nhiều quà tặng hấp dẫn.</li><li><strong>Hỗ trợ trả góp:</strong> Trả góp 0% qua thẻ tín dụng hoặc công ty tài chính với thủ tục đơn giản, duyệt hồ sơ nhanh chóng.</li><li><strong>Giao hàng tận nơi:</strong> Miễn phí vận chuyển toàn quốc, kiểm tra máy trước khi thanh toán.</li></ul>";
        String warrantyHtml = "<h2>Chính sách bảo hành</h2><ul><li><strong>Thời gian bảo hành:</strong> Bảo hành phần cứng từ 3 đến 12 tháng tùy theo dòng sản phẩm (được ghi rõ trên phiếu bảo hành).</li><li><strong>Bảo hành phần mềm:</strong> Hỗ trợ cài đặt phần mềm, vệ sinh máy miễn phí trọn đời.</li><li><strong>Điều kiện bảo hành:</strong> Sản phẩm còn nguyên tem bảo hành của Tech Shop, không có dấu hiệu rơi vỡ, vào nước, cháy nổ hoặc tự ý tháo lắp sửa chữa.</li><li><strong>Phạm vi bảo hành:</strong> Bảo hành toàn bộ phần cứng bao gồm: Mainboard, CPU, RAM, Ổ cứng, Màn hình, Bàn phím, Touchpad. Không bảo hành các phụ kiện tặng kèm (chuột, túi chống sốc...).</li><li><strong>Bảo hành Pin:</strong> Pin được bảo hành 3 tháng (điều kiện sức khỏe pin trên 80% lúc mua). Hao mòn tự nhiên trong quá trình sử dụng không được bảo hành.</li></ul><h2>Chính sách đổi trả (1 đổi 1)</h2><ul><li><strong>Thời gian áp dụng:</strong> Trong vòng 30 ngày đầu tiên kể từ ngày mua máy.</li><li><strong>Điều kiện đổi trả:</strong> Sản phẩm bị lỗi phần cứng do nhà sản xuất. Sản phẩm còn nguyên trạng, không trầy xước, cấn móp, rơi vỡ, vào nước. Còn đầy đủ phụ kiện và hóa đơn mua hàng.</li><li><strong>Sản phẩm không lỗi:</strong> Trong trường hợp khách hàng muốn đổi sang sản phẩm khác khi máy không có lỗi, Tech Shop sẽ thu lại máy với mức phí thỏa thuận (thường từ 10% - 20% giá trị máy) tùy theo tình trạng và thời gian sử dụng.</li></ul><h2>Quy trình xử lý</h2><ol><li><strong>Tiếp nhận:</strong> Khách hàng mang máy hoặc gửi máy qua đường bưu điện đến Tech Shop.</li><li><strong>Kiểm tra:</strong> Kỹ thuật viên kiểm tra và thông báo tình trạng, nguyên nhân lỗi trong vòng 24h.</li><li><strong>Xử lý:</strong> Thời gian sửa chữa/đổi máy từ 1-7 ngày làm việc tùy mức độ hư hỏng và linh kiện thay thế.</li><li><strong>Hoàn trả:</strong> Thông báo khách hàng đến nhận máy hoặc gửi trả máy qua bưu điện. Tech Shop chịu 100% chi phí vận chuyển 2 chiều nếu máy lỗi trong thời gian 1 đổi 1.</li></ol>";
        String installmentHtml = "<h2>Hướng dẫn mua trả góp</h2><p>Tech Shop hỗ trợ 2 hình thức mua trả góp tiện lợi, duyệt hồ sơ nhanh chóng giúp bạn dễ dàng sở hữu thiết bị ưng ý.</p><h2>1. Trả góp qua thẻ tín dụng (Lãi suất 0%)</h2><p>Áp dụng cho khách hàng có thẻ tín dụng (Credit Card) của các ngân hàng liên kết.</p><ul><li><strong>Lãi suất:</strong> 0% (Không phát sinh lãi hàng tháng).</li><li><strong>Phí chuyển đổi:</strong> Khách hàng thanh toán 1 lần phí chuyển đổi trả góp theo quy định của ngân hàng (từ 2% - 6% tùy kỳ hạn).</li><li><strong>Kỳ hạn:</strong> Linh hoạt 3, 6, 9, 12 tháng.</li><li><strong>Thủ tục:</strong> Chỉ cần quẹt thẻ tín dụng. Không cần giấy tờ tùy thân, không gọi thẩm định.</li></ul><h2>2. Trả góp qua công ty tài chính</h2><p>Áp dụng cho khách hàng không có thẻ tín dụng, sử dụng dịch vụ của HD Saison, Home Credit, FE Credit...</p><ul><li><strong>Lãi suất:</strong> Từ 1.09% - 2.5%/tháng (tùy theo hồ sơ và công ty tài chính).</li><li><strong>Trả trước:</strong> Từ 10% - 70% giá trị máy.</li><li><strong>Kỳ hạn:</strong> 6, 9, 12 tháng.</li><li><strong>Độ tuổi:</strong> Khách hàng từ 18 tuổi trở lên.</li><li><strong>Thủ tục:</strong> Chứng minh nhân dân / Căn cước công dân gắn chip. Có thể cần thêm Giấy phép lái xe hoặc Hộ khẩu (để được lãi suất tốt hơn). Thời gian xét duyệt 15 - 30 phút.</li></ul>";

        jdbcTemplate.update("UPDATE post SET content = ? WHERE slug = 'faq'", faqHtml);
        jdbcTemplate.update("UPDATE post SET content = ? WHERE slug = 'about'", aboutHtml);
        jdbcTemplate.update("UPDATE post SET content = ? WHERE slug = 'warranty'", warrantyHtml);
        jdbcTemplate.update("UPDATE post SET content = ? WHERE slug = 'installment'", installmentHtml);

        return "OK seeded";
    }

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
