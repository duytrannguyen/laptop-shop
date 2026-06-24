package com.techshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String label;

    @Column(length = 500)
    private String url;

    /** MENU or FOOTER */
    @Column(nullable = false, length = 20)
    private String type;

    /** null = root item; non-null = child of another MenuItem */
    private Long parentId;

    @Column(nullable = false)
    private Integer sortOrder;
}
