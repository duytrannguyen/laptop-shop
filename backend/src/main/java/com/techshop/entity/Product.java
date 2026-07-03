package com.techshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 250)
    private String name;

    @Column(nullable = false, unique = true, length = 260)
    private String slug;

    @Column(unique = true, length = 100)
    private String sku;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;
    private BigDecimal price;
    private BigDecimal salePrice;
    private LocalDateTime saleStartTime;
    private LocalDateTime saleEndTime;

    @Column(length = 1500)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String gallery;

    private String cpu;
    private String ram;
    private String ssd;
    private String screen;
    private String vga;
    private String battery;
    private String weight;
    private Integer stock;
    private boolean featured;
    private boolean active;
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String promotion;

    @Column(columnDefinition = "TEXT")
    private String specs;

    private String metaTitle;

    @Column(length = 500)
    private String metaDescription;

    private String metaImage;
    
    @ManyToOne
    @JoinColumn(name = "product_group_id")
    private ProductGroup productGroup;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "product_need",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "need_id")
    )
    private java.util.Set<Need> needs = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
}
