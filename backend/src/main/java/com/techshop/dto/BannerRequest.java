package com.techshop.dto;

import jakarta.validation.constraints.*;

public record BannerRequest(
        @Size(max = 20)  String position,
        @Size(max = 300) String title,
        @Size(max = 500) String description,
        @Size(max = 1500) String imageUrl,
        @Size(max = 500) String background,
        @Size(max = 500) String linkUrl,
        boolean active,
        Integer sortOrder,
        @Size(max = 50) String type
) {}
