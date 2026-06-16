package com.laptopshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(length = 80)
    private String badge;

    @Column(length = 1500)
    private String imageUrl;

    @Column(length = 500)
    private String linkUrl;

    @Column(length = 120)
    private String background;

    private Integer sortOrder;
    private boolean active;
}
