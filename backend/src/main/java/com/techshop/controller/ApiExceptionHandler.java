package com.techshop.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

/**
 * Xử lý lỗi toàn cục cho tất cả API trong ứng dụng.
 *
 * Thay vì để từng controller tự bắt lỗi, class này dùng @RestControllerAdvice
 * để tập trung xử lý và trả về response lỗi thống nhất theo format:
 * { "status": 400, "message": "Mô tả lỗi" }
 *
 * Các loại lỗi được xử lý:
 * - Validation lỗi (@Valid) → 400 Bad Request
 * - ResponseStatusException (lỗi tùy chỉnh) → status tương ứng
 * - DataIntegrityViolation (lỗi unique/foreign key DB) → 409 Conflict
 * - IllegalArgumentException (dữ liệu không hợp lệ) → 400 Bad Request
 * - Exception bất kỳ → 500 Internal Server Error
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    /**
     * Lỗi validation từ @Valid annotation (ví dụ: field bắt buộc bị bỏ trống, sai định dạng email...).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Dữ liệu không hợp lệ");
        return response(HttpStatus.BAD_REQUEST, message);
    }

    /**
     * Lỗi do controller tự ném ra (ví dụ: không tìm thấy sản phẩm → 404, chưa đăng nhập → 401...).
     */
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, Object>> status(ResponseStatusException ex) {
        return response(HttpStatus.valueOf(ex.getStatusCode().value()), ex.getReason());
    }

    /**
     * Lỗi từ database: vi phạm ràng buộc unique hoặc foreign key (ví dụ: slug trùng, xóa danh mục đang có sản phẩm).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, Object>> integrity(DataIntegrityViolationException ex) {
        return response(HttpStatus.CONFLICT, "Dữ liệu bị trùng hoặc đang được sử dụng");
    }

    /**
     * Lỗi logic nghiệp vụ (ví dụ: số lượng đặt hàng vượt tồn kho, giá bán lớn hơn giá gốc...).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, Object>> illegal(IllegalArgumentException ex) {
        return response(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /**
     * Lỗi không xác định – bắt tất cả exception còn lại → trả về 500.
     */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> fallback(Exception ex) {
        ex.printStackTrace();
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Máy chủ không thể xử lý yêu cầu: " + ex.getMessage());
    }

    /** Helper: tạo response body thống nhất { status, message } */
    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "message", message == null ? status.getReasonPhrase() : message));
    }
}
