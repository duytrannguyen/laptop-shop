package com.techshop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 250)
    @Column(nullable = false, length = 250)
    private String title;

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug không hợp lệ")
    @Column(nullable = false, unique = true, length = 260)
    private String slug;

    @Column(length = 1500)
    private String image;

    @NotBlank
    @Size(max = 20000)
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    private LocalDateTime createdAt;
    private boolean active;
    
    @Column(length = 50)
    @Builder.Default
    private String type = "ARTICLE";

    @Column(length = 250)
    private String metaTitle;

    @Column(length = 500)
    private String metaDescription;

    @Column(length = 1000)
    private String metaImage;
}
