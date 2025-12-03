package com.back.dto.request;

import jakarta.validation.constraints.NotNull;

public record MarketAnalysisRequest(
        @NotNull(message = "행정동 코드는 필수입니다.")
        String admCode,       // 예: "1168051000" (법정동/행정동 코드)

        @NotNull(message = "업종 ID는 필수입니다.")
        Long categoryId,      // 예: 1 (한식), 2 (카페)

        // 가중치 커스텀 옵션
        WeightOption weightOption
) {
    public record WeightOption(
            double salesWeight,    // 매출 비중
            double stabilityWeight, // 안정성(폐업률) 비중
            double growthWeight      // 성장률 비중
    ) {}
}