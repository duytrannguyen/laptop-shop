package com.techshop.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record CategoryRequest(
    @NotBlank @Size(max = 160) String name,
    @NotBlank @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug không hợp lệ") @Size(max = 180) String slug,
    String image,
    boolean active,
    String displayType,
    Integer displayCount,
    Integer sliderInterval,
    Integer sliderSpeed,
    List<Long> parentIds
) {}
