package com.laptopshop.dto;

import jakarta.validation.constraints.*;

public record ContactRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ") String phone,
        @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 3000) String content
) {}
