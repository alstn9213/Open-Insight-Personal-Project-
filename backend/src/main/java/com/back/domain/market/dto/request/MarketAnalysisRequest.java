package com.back.domain.market.dto.request;

import jakarta.validation.constraints.NotNull;

public record MarketAnalysisRequest(
        String admCode,
        Long categoryId,
        @NotNull(message = "정렬 기준은 필수입니다.")
        SortOption sortOption
) {
    public enum SortOption {
        OPPORTUNITY,    // 틈새시장 (점포당 유동인구 많은 순 DESC)
        OVERCROWDED,    // 경쟁과열 (점포당 유동인구 적은 순 ASC)
        POPULATION,     // 유동인구 많은 순 (DESC)
        STORE_COUNT     // 점포 수 많은 순 (DESC)
    }
}