package com.back.dto.response;

public record StartupRankingResponse(
        int rank,               // 순위 (1, 2, 3...)
        String regionName,      // 지역명
        String categoryName,    // 업종명
        double totalScore,      // 계산된 종합 점수 (알고리즘 결과)
        String badge            // "수익성 BEST", "안전성 BEST" 등 뱃지
) {
    // 생성자나 빌더 패턴을 활용해 서비스 단에서 계산된 score 주입
}