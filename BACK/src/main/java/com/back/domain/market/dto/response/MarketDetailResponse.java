package com.back.domain.market.dto.response;

import com.back.domain.market.entity.MarketStats;
import com.back.domain.market.entity.MarketGrade;

public record MarketDetailResponse(
        Long statsId,
        String regionName,      // "서울특별시 강남구" (Region 엔티티 결합)
        String categoryName,    // "카페"
        long averageSales,      // 평균 매출
        int storeCount,         // 점포 수
        double growthRate,      // 성장률
        double closingRate,     // 폐업률
        double netGrowthRate,   // 순 성장률
        MarketGrade marketGrade,// 등급 (RED, YELLOW, GREEN)
        String description,     // "추천 상권"
        String label            // "안전"
) {
    public static MarketDetailResponse from(MarketStats stats) {
        return new MarketDetailResponse(
                stats.getId(),
                stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict(),
                stats.getCategory().getName(),
                stats.getAverageSales(),
                stats.getStoreCount(),
                stats.getGrowthRate(),
                stats.getClosingRate(),
                stats.getNetGrowthRate(),
                stats.getMarketGrade(),
                stats.getMarketGrade().getDescription(),
                stats.getMarketGrade().getLabel()
        );
    }

}