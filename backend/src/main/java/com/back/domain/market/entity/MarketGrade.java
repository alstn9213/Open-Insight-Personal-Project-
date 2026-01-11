package com.back.domain.market.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MarketGrade {

    GREEN("추천 상권", "#00FF00"), // 프론트에서 쓸 색상 코드까지 포함 가능
    YELLOW("주의 상권", "#FFFF00"),
    RED("위험 상권", "#FF0000");

    private final String description; // 예: "추천 상권"
    private final String colorCode;   // 예: "#00FF00" (선택 사항)
}