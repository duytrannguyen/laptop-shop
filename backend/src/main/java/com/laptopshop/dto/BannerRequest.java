package com.laptopshop.dto;

import jakarta.validation.constraints.*;

public record BannerRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 500) String description,
        @Size(max = 80) String badge,
        @Size(max = 1500) String imageUrl,
        @Size(max = 500) String linkUrl,
        @Size(max = 120) String background,
        @Min(0) Integer sortOrder,
        boolean active
) {}
