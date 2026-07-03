package com.techshop.controller;

import com.techshop.dto.OrderRequest;
import com.techshop.entity.*;
import com.techshop.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.techshop.service.NotificationService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Controller xử lý đơn hàng của khách hàng.
 *
 * Endpoint công khai (không cần đăng nhập):
 * - POST /api/orders        → Khách đặt hàng mới
 * - GET  /api/orders/track  → Khách tra cứu đơn hàng theo số điện thoại
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final ProductRepository products;
    private final OrderRepository orders;
    private final NotificationService notificationService;

    /**
     * Tạo đơn hàng mới.
     *
     * Quy trình:
     * 1. Gộp các item trùng productId (tránh đặt 2 lần cùng 1 sản phẩm)
     * 2. Kiểm tra sản phẩm tồn tại, còn hàng và số lượng không vượt tồn kho
     * 3. Tính tổng tiền (dùng salePrice nếu có, không thì dùng price)
     * 4. Lưu đơn hàng, trừ tồn kho sản phẩm
     * 5. Tạo thông báo real-time cho Admin qua SSE
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional // Đảm bảo toàn bộ giao dịch thành công hoặc rollback hoàn toàn
    public Order create(@Valid @RequestBody OrderRequest request) {
        // Gộp số lượng các item có cùng productId
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        request.items().forEach(item -> quantities.merge(item.productId(), item.quantity(), Integer::sum));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (var entry : quantities.entrySet()) {
            // Kiểm tra sản phẩm tồn tại và đang active
            Product product = products.findById(entry.getKey())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không còn tồn tại"));

            int quantity = entry.getValue();
            int stock = product.getStock() == null ? 0 : product.getStock();

            // Kiểm tra đủ hàng không
            if (quantity > stock) {
                throw new IllegalArgumentException("Sản phẩm " + product.getName() + " chỉ còn " + stock + " sản phẩm");
            }

            // Dùng giá khuyến mãi nếu có, không thì dùng giá gốc
            BigDecimal price = product.getSalePrice() != null && product.getSalePrice().signum() > 0
                    ? product.getSalePrice() : product.getPrice();
            if (price == null) {
                throw new IllegalArgumentException("Sản phẩm " + product.getName() + " chưa có giá bán");
            }

            items.add(OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(quantity)
                    .price(price)
                    .build());

            total = total.add(price.multiply(BigDecimal.valueOf(quantity)));
            // Trừ tồn kho ngay khi đặt hàng
            product.setStock(stock - quantity);
        }

        // Lưu đơn hàng với trạng thái ban đầu là PENDING (chờ xác nhận)
        Order order = Order.builder()
                .customerName(request.customerName().trim())
                .phone(normalizePhone(request.phone()))
                .address(request.address().trim())
                .note(request.note() == null ? null : request.note().trim())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .total(total)
                .items(items)
                .build();

        Order savedOrder = orders.save(order);

        // Gửi thông báo real-time cho Admin qua SSE
        notificationService.createOrderNotification(savedOrder);

        return savedOrder;
    }

    /**
     * Tra cứu đơn hàng theo số điện thoại.
     * Chỉ chấp nhận số điện thoại Việt Nam hợp lệ (0xxx hoặc +84xxx).
     */
    @GetMapping("/track")
    public List<Order> track(@RequestParam String phone) {
        String normalized = normalizePhone(phone);
        if (!normalized.matches("^(\\+84|0)[0-9]{9,10}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ");
        }
        return orders.findByPhoneOrderByCreatedAtDesc(normalized);
    }

    /** Chuẩn hóa số điện thoại: xóa khoảng trắng, dấu chấm, dấu gạch ngang. */
    private String normalizePhone(String value) {
        return value == null ? "" : value.replaceAll("[\\s.-]", "");
    }
}
