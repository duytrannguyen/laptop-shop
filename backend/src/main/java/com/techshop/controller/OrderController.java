package com.techshop.controller;

import com.techshop.dto.OrderRequest;
import com.techshop.entity.*;
import com.techshop.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final ProductRepository products;
    private final OrderRepository orders;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Order create(@Valid @RequestBody OrderRequest request) {
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        request.items().forEach(item -> quantities.merge(item.productId(), item.quantity(), Integer::sum));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (var entry : quantities.entrySet()) {
            Product product = products.findById(entry.getKey())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không còn tồn tại"));
            int quantity = entry.getValue();
            int stock = product.getStock() == null ? 0 : product.getStock();
            if (quantity > stock) {
                throw new IllegalArgumentException("Sản phẩm " + product.getName() + " chỉ còn " + stock + " sản phẩm");
            }
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
            product.setStock(stock - quantity);
        }

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
        return orders.save(order);
    }

    @GetMapping("/track")
    public List<Order> track(@RequestParam String phone) {
        String normalized = normalizePhone(phone);
        if (!normalized.matches("^(\\+84|0)[0-9]{9,10}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ");
        }
        return orders.findByPhoneOrderByCreatedAtDesc(normalized);
    }

    private String normalizePhone(String value) {
        return value == null ? "" : value.replaceAll("[\\s.-]", "");
    }
}
