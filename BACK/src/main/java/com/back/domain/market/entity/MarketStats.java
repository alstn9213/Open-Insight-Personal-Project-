package com.back.domain.market.entity;

import com.back.domain.category.entity.Category;
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

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer malePopulation;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer femalePopulation;

    // 연령대 그룹 (예: "20대", "30대")
    @Column(length = 20)
    private String AgeGroup;

    @Column(name = "population_per_store")
    private Double populationPerStore;

    // 밀도 등급 (여유, 보통, 밀집)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketGrade marketGrade;

}