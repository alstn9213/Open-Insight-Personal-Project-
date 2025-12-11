package com.back.domain.market.entity;

import com.back.domain.category.Category;
import com.back.domain.common.BaseTimeEntity;
import com.back.domain.region.entity.Region;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "market_stats")
public class MarketStats extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stats_id")
    private Long id;

    // 지역 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    // 업종 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private Integer storeCount; // 총 점포 수

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer floatingPopulation; // 유동인구

    private Double growthRate; // 점포 증가율 (%)
    private Double closingRate; // 폐업률 (%)
    private Long averageSales; // 평균 매출 (원)
    private Double netGrowthRate; // 순성장률 (성장률 - 폐업률)

    // 시장 등급 (RED, YELLOW, GREEN)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketGrade marketGrade;

}