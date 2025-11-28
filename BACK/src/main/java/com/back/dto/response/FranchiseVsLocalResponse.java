package com.back.dto.response;

import com.back.domain.franchise.Franchise;
import com.back.domain.market.MarketStats;

public record FranchiseVsLocalResponse(
        String brandName,           // 프랜차이즈 이름
        ComparisonItem lifespan,    // 존속 기간 비교 (개월)
        ComparisonItem initialCost, // 초기 비용 비교 (만원)
        ComparisonItem risk         // 위험도/폐업률 비교 (%)
) {
    // 비교 항목 내부 레코드
    public record ComparisonItem(
            double franchiseValue,  // 프랜차이즈 데이터
            double localAverage,    // 지역 평균 데이터
            String diffMessage      // "평균보다 12% 낮음" 등의 분석 멘트
    ) {}

    public static FranchiseVsLocalResponse of(Franchise f, MarketStats m) {
        return new FranchiseVsLocalResponse(
                f.getBrandName(),
                new ComparisonItem(f.getAverageLifespan(), 36.0, "평균 대비 오래 생존"),
                new ComparisonItem(f.getInitialCost(), 5000, "초기 비용 높음"),
                new ComparisonItem(15.0, m.getClosingRate(), "폐업률 낮음")
        );
    }
}