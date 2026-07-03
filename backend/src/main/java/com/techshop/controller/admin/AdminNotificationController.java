package com.techshop.controller.admin;

import com.techshop.entity.AdminNotification;
import com.techshop.repository.AdminNotificationRepository;
import com.techshop.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * API quản lý thông báo real-time cho Admin (chỉ ADMIN mới truy cập được).
 *
 * Các chức năng:
 * - GET  /api/admin/notifications           → Lấy 50 thông báo mới nhất
 * - GET  /api/admin/notifications/unread-count → Đếm số thông báo chưa đọc (hiển thị badge)
 * - PUT  /api/admin/notifications/{id}/read → Đánh dấu 1 thông báo đã đọc
 * - PUT  /api/admin/notifications/read-all  → Đánh dấu tất cả đã đọc
 * - GET  /api/admin/notifications/stream    → Kết nối SSE nhận thông báo real-time
 */
@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {
    private final AdminNotificationRepository notificationRepository;
    private final NotificationService notificationService;

    /** Lấy 50 thông báo gần nhất (sắp xếp mới nhất lên đầu). */
    @GetMapping
    public List<AdminNotification> getNotifications() {
        return notificationRepository.findTop50ByOrderByCreatedAtDesc();
    }

    /** Đếm số thông báo chưa đọc → hiển thị số đỏ trên icon chuông. */
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        return Map.of("count", notificationRepository.countByIsReadFalse());
    }

    /** Đánh dấu một thông báo cụ thể là đã đọc (khi admin click vào). */
    @PutMapping("/{id}/read")
    public AdminNotification markAsRead(@PathVariable Long id) {
        AdminNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /** Đánh dấu tất cả thông báo là đã đọc (khi admin nhấn "Đánh dấu tất cả"). */
    @PutMapping("/read-all")
    @Transactional
    public Map<String, Integer> markAllAsRead() {
        int updated = notificationRepository.markAllAsRead();
        return Map.of("updated", updated);
    }

    /**
     * Kết nối SSE (Server-Sent Events) để nhận thông báo real-time.
     * Frontend giữ kết nối này liên tục; khi có đơn hàng mới, server tự đẩy dữ liệu xuống.
     * Tham số token trong URL dùng để xác thực vì EventSource không hỗ trợ set Authorization header.
     */
    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return notificationService.subscribe();
    }
}
