package com.techshop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, unique = true, length = 160)
    private String name;

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug không hợp lệ")
    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    private String image;
    private boolean active;
}
