package com.laptopshop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequest(
        @NotBlank @Size(max = 160) String customerName,
        @NotBlank @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ") String phone,
        @NotBlank @Size(max = 500) String address,
        @Size(max = 1000) String note,
        @NotEmpty List<@Valid Item> items
) {
    public record Item(@NotNull Long productId, @NotNull @Min(1) @Max(20) Integer quantity) {}
}
