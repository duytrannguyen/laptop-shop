package com.techshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Vị trí hiển thị: SLIDER | SIDEBAR | STRIP */
    @Column(length = 20)
    private String position;

    /** Tiêu đề (banner phụ/strip) */
    @Column(length = 300)
    private String title;

    /** Mô tả ngắn (slider + banner phụ) */
    @Column(length = 500)
    private String description;

    /** URL hình ảnh (slider) */
    @Column(length = 1500)
    private String imageUrl;

    /** Màu nền / gradient (banner phụ + strip) */
    @Column(length = 500)
    private String background;

    /** Đường dẫn khi click */
    @Column(length = 500)
    private String linkUrl;

    private boolean active;

    @Column(name = "sort_order")
    private Integer sortOrder;

    /** Loại slide: "Hình ảnh" | "Video" | "Youtube" | "Hình ảnh & Nội dung" */
    @Column(length = 50)
    private String type;
}
