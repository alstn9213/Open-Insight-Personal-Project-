package com.back.domain.market.dto.response;

import com.back.domain.market.entity.MarketStats;
import com.back.domain.market.entity.MarketGrade;

public record MarketMapResponse(
        String admCode,         // 행정동 코드 (지도 폴리곤 매핑용 key)
        String district,        // 구 이름 (예: "강남구")
        Integer storeCount,         // 점포 수 (밀집도 시각화용)
        MarketGrade marketGrade// 밀도 등급 (지도 색상 결정: RED, YELLOW, GREEN)
) {
    public static MarketMapResponse from(MarketStats stats) {
        return new MarketMapResponse(
                stats.getRegion().getAdmCode(),
                stats.getRegion().getDistrict(),
                stats.getStoreCount(),
                stats.getMarketGrade()
        );
    }
}