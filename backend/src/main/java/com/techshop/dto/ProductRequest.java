package com.techshop.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 250) String name,
        @NotBlank @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug không hợp lệ") String slug,
        @Size(max = 100) String sku,
        Long brandId,
        @NotNull @DecimalMin("0") BigDecimal price,
        @DecimalMin("0") BigDecimal salePrice,
        @Size(max = 1500) String image,
        String gallery,
        String cpu,
        String ram,
        String ssd,
        String screen,
        String vga,
        String battery,
        String weight,
        @Min(0) Integer stock,
        boolean featured,
        boolean active,
        @Size(max = 5000) String description,
        @Size(max = 20000) String content,
        @Size(max = 5000) String promotion,
        @Size(max = 10000) String specs,
        String metaTitle,
        @Size(max = 500) String metaDescription,
        String metaImage,
        Long productGroupId,
        java.util.List<Long> needIds,
        Long categoryId
) {}
