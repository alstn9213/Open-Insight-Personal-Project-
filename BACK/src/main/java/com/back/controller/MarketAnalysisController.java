package com.back.controller;

import com.back.dto.request.MarketAnalysisRequest;
import com.back.dto.response.StartupRankingResponse;
import com.back.service.analysis.MarketAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketAnalysisController {

    private final MarketAnalysisService marketAnalysisService;

    // 2.2 맞춤형 창업 순위 추천
    @PostMapping("/recommend")
    public ResponseEntity<List<StartupRankingResponse>> recommendStartup(
            @Valid @RequestBody MarketAnalysisRequest request) {
        List<StartupRankingResponse> rankings = marketAnalysisService.recommendStartups(request);
        return ResponseEntity.ok(rankings);
    }

    // 2.1 상권 상세 분석 엔드포인트 추가 필요...
}