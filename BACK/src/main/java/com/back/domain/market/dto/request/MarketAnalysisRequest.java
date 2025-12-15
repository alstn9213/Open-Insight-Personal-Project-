package com.back.domain.market.dto.request;

public record MarketAnalysisRequest(
        String admCode,
        Long categoryId,
        WeightOption weightOption
) {
    public MarketAnalysisRequest {
        // 만약 프론트에서 weightOption을 안 보냈다면(null), 기본값을 넣어준다.
        if(weightOption == null) {
            weightOption = new WeightOption(0.4, 0.4, 0.2);
        }
    }

    // 프론트에서 사용자의 가중치 조절을 전달하기 위한 내부 레코드
    public record WeightOption(
            double salesWeight,    // 매출 비중
            double stabilityWeight, // 안정성(폐업률) 비중
            double growthWeight      // 성장률 비중
    ) {

    }
}