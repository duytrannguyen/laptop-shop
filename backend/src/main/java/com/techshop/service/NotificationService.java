package com.techshop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.entity.AdminNotification;
import com.techshop.entity.Order;
import com.techshop.repository.AdminNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Dịch vụ quản lý thông báo real-time cho Admin bằng SSE (Server-Sent Events).
 *
 * Cách hoạt động:
 * 1. Admin mở trang → frontend kết nối đến /api/admin/notifications/stream (SSE)
 * 2. Server giữ kết nối mở và lưu vào danh sách emitters
 * 3. Khi có đơn hàng mới → createOrderNotification() được gọi từ OrderController
 * 4. Service lưu thông báo vào DB và đẩy sự kiện "new-order" đến tất cả admin đang online
 * 5. Frontend nhận event → hiện thông báo ngay lập tức (không cần refresh trang)
 *
 * Dùng CopyOnWriteArrayList để thread-safe khi nhiều request cùng thêm/xóa emitter.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final AdminNotificationRepository notificationRepository;

    // Danh sách các kết nối SSE đang mở (mỗi tab/cửa sổ admin = 1 emitter)
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Đăng ký kết nối SSE mới.
     * Gọi khi admin vào trang → giữ kết nối "vô tận" (Long.MAX_VALUE timeout).
     * Tự động xóa emitter khi kết nối bị đóng/lỗi/timeout.
     */
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        // Tự xóa khỏi danh sách khi kết nối kết thúc
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        return emitter;
    }

    /**
     * Tạo thông báo đơn hàng mới và đẩy real-time đến tất cả admin đang online.
     *
     * @param order Đơn hàng vừa được tạo (từ OrderController)
     */
    public void createOrderNotification(Order order) {
        // Tạo nội dung thông báo
        String message = "Có đơn hàng mới từ " + order.getCustomerName() +
                         " trị giá " + String.format("%,.0f", order.getTotal()) + "đ";

        // Lưu thông báo vào database để hiển thị lại sau khi đăng nhập lại
        AdminNotification notification = AdminNotification.builder()
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .type("NEW_ORDER")
                .relatedId(order.getId())
                .build();
        notification = notificationRepository.save(notification);

        // Đẩy thông báo đến tất cả admin đang kết nối SSE
        List<SseEmitter> deadEmitters = new java.util.ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                String json = objectMapper.writeValueAsString(notification);
                emitter.send(SseEmitter.event().name("new-order").data(json));
            } catch (IOException e) {
                // Kết nối đã bị đóng → đánh dấu để xóa
                deadEmitters.add(emitter);
            }
        }
        // Dọn sạch các kết nối đã chết
        emitters.removeAll(deadEmitters);
    }
}
