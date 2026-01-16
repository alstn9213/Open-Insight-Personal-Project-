package com.back.domain.market.dto.response;

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

}