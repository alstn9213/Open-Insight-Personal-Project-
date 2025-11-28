package com.back.domain.franchise;

import com.back.domain.category.Category;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "franchises")
public class Franchise {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "franchise_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String brandName;

    // 평균 존속 기간 (개월 수 등)
    private Integer averageLifespan;

    // 초기 창업 비용 (원)
    private Long initialCost;

    // 본사 부담금 / 로열티 등
    private Long franchiseFee;
}