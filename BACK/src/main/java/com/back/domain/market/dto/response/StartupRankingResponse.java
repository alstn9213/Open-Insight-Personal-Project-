package com.back.domain.market.dto.response;

import com.back.domain.market.entity.MarketStats;

public record StartupRankingResponse(
        Integer rank,               // 순위 (1, 2, 3...)
        String regionName,      // 지역명
        String categoryName,    // 업종명
        Double totalScore,      // 계산된 종합 점수 (알고리즘 결과)
        String badge            // "수익성 BEST", "안전성 BEST" 등 뱃지
) {
    public static StartupRankingResponse of(int rank, MarketStats stats, double score, String badge) {
        return new StartupRankingResponse(
                rank,
                stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict(),
                stats.getCategory().getName(),
                Math.round(score * 10) / 10.0,
                badge
        );
    }
}