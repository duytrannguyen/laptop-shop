package com.techshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {
    @Id
    private Long id;

    // === Thông tin chung ===
    private String storeName;
    private String shortName;

    @Column(length = 500)
    private String slogan;

    private String hotline;
    private String email;
    private String supportEmail;

    @Column(length = 1000)
    private String address;

    private String openingHours;

    @Column(length = 1000)
    private String mapUrl;

    // === Hình ảnh ===
    private String logoUrl;
    private String faviconUrl;
    private String logoFooterUrl;

    // === Mạng xã hội ===
    private String facebookUrl;
    private String facebookGroupUrl;
    private String zaloUrl;
    private String zaloGroupUrl;
    private String youtubeUrl;
    private String tiktokUrl;
    private String instagramUrl;

    // === SEO / Tracking ===
    @Column(length = 2000)
    private String googleTagScript;

    @Column(length = 500)
    private String metaDescription;

    // === Tính năng ===
    private Boolean maintenanceMode;
    private Boolean popupEnabled;

    @Column(length = 500)
    private String popupImageUrl;

    @Column(length = 500)
    private String popupLinkUrl;

    // === Công cụ ảnh (Watermark/Frame Auto) ===
    private String watermarkLogoUrl;
    private String watermarkPosition; // 'bottom-right', 'center', etc.
    private Integer watermarkSizePct; // 5-50%
    private Double watermarkOpacity; // 0.1-1.0

    private String frameUrl;
    private String frameMode; // 'overlay' or 'background'
    private Integer framePaddingPct; // 0-50%

    // === Tự động xóa nền ===
    private String autoRemoveBg; // 'none', 'main', 'gallery', 'both'
}
