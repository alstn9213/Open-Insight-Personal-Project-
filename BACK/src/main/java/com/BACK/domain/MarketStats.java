package com.BACK.domain;

import com.BACK.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "market_stats")
public class MarketStats extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    // 총 점포 수
    private Integer storeCount;

    // 점포 증가율 (%)
    private Double growthRate;

    // 폐업률 (%)
    private Double closingRate;

    // 평균 매출 (원)
    private Long averageSales;

    // 포화 지수 (자체 계산 로직 결과값)
    private Double saturationIndex;

    // 시장 등급 (RED, YELLOW, GREEN)
    @Enumerated(EnumType.STRING)
    private MarketGrade marketGrade;

    public enum MarketGrade {
        RED, YELLOW, GREEN
    }
}