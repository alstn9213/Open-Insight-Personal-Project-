package com.back.domain.market.dto.response;

import com.back.domain.market.entity.MarketStats;

public record StartupRankingResponse(
        int rank,
        String regionName,
        String categoryName,
        int storeCount,
        int floatingPopulation,
        double populationPerStore,  // ★ 핵심: 점포 1개당 유동인구 (높을수록 좋음)
        String badge                // 뱃지 (예: "💎 기회", "🔥 과열")
) {

}