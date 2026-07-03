package com.techshop.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String name;

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug không hợp lệ")
    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    private String image;
    private boolean active;

    @Column(name = "sort_order", columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "display_type", length = 20)
    @Builder.Default
    private String displayType = "GRID";

    @Column(name = "display_count")
    @Builder.Default
    private Integer displayCount = 10;

    @Column(name = "slider_interval")
    @Builder.Default
    private Integer sliderInterval = 3000;

    @Column(name = "slider_speed")
    @Builder.Default
    private Integer sliderSpeed = 500;


    /**
     * Danh sách danh mục CHA chứa category này.
     * Bỏ qua khi serialize JSON để tránh vòng lặp vô hạn.
     */
    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "category_parent",
        joinColumns = @JoinColumn(name = "child_id"),
        inverseJoinColumns = @JoinColumn(name = "parent_id")
    )
    @Builder.Default
    private Set<Category> parents = new HashSet<>();

    /**
     * Danh sách danh mục CON thuộc category này.
     * Được trả về trong JSON (dùng cho tree view).
     * KHÔNG dùng @Builder.Default vì là mappedBy - Hibernate quản lý.
     */
    @ManyToMany(mappedBy = "parents", fetch = FetchType.EAGER)
    private Set<Category> children = new HashSet<>();
}
