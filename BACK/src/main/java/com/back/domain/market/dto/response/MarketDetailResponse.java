package com.back.domain.market.dto.response;

import com.back.domain.market.entity.MarketStats;
import com.back.domain.market.entity.MarketGrade;

public record MarketDetailResponse(
        Long statsId,
        String regionName,      // "서울특별시 강남구" (Region 엔티티 결합)
        String categoryName,
        Long averageSales,
        Integer storeCount,
        Integer floatingPopulation,
        Double growthRate,
        Double closingRate,
        Double netGrowthRate,
        MarketGrade marketGrade,// 등급 (RED, YELLOW, GREEN)
        String description     // "추천 상권"
) {
    public static MarketDetailResponse from(MarketStats stats) {
        return new MarketDetailResponse(
                stats.getId(),
                stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict(),
                stats.getCategory().getName(),
                stats.getAverageSales(),
                stats.getStoreCount(),
                stats.getFloatingPopulation() != null ? stats.getFloatingPopulation() : 0,
                stats.getGrowthRate(),
                stats.getClosingRate(),
                stats.getNetGrowthRate(),
                stats.getMarketGrade(),
                stats.getMarketGrade().getDescription()
        );
    }

}