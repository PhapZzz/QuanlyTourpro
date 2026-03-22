package com.tourpro.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "positions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Position {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    private BigDecimal baseSalaryMin;
    private BigDecimal baseSalaryMax;
}
