package com.back.domain.market.dto.response;

import com.back.domain.market.entity.MarketStats;
import com.back.domain.market.entity.MarketGrade;

public record MarketDetailResponse(
        Long statsId,
        String regionName,      // "서울특별시 강남구" (Region 엔티티 결합)
        String categoryName,
        Integer storeCount,
        Integer floatingPopulation,
        Double populationPerStore,
        MarketGrade marketGrade,// 밀도 등급 (여유, 보통, 밀집)
        String description,     // "경쟁이 치열합니다" 등의 멘트
        Integer malePercent,
        Integer femalePercent,
        String ageGroup
) {
    public static MarketDetailResponse from(MarketStats stats) {
        // 유동인구가 없거나 점포가 0일 때의 예외처리
        double popPerStore = (stats.getStoreCount() > 0)
                ? (double) stats.getFloatingPopulation() / stats.getStoreCount()
                : 0.0;
        int totalPop = stats.getFloatingPopulation();
        int malePer = 0;
        int femalePer = 0;

        if(totalPop > 0) {
            malePer = (int) Math.round(((double) stats.getMalePopulation() / totalPop) * 100);
            femalePer = 100 - malePer;
        }

        return new MarketDetailResponse(
                stats.getId(),
                stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict() + " " + stats.getRegion().getTown(),
                stats.getCategory().getName(),
                stats.getStoreCount(),
                stats.getFloatingPopulation(),
                Math.round(popPerStore * 10) / 10.0,
                stats.getMarketGrade(),
                stats.getMarketGrade().getDescription(),
                malePer,
                femalePer,
                stats.getAgeGroup() != null ? stats.getAgeGroup() : "분석중"
        );
    }

}