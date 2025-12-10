package com.back.domain.market.controller;

import com.back.domain.market.dto.request.MarketAnalysisRequest;
import com.back.domain.market.dto.response.MarketDetailResponse;
import com.back.domain.market.dto.response.MarketMapResponse;
import com.back.domain.market.dto.response.StartupRankingResponse;
import com.back.domain.market.service.analysis.MarketAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketAnalysisController {

    private final MarketAnalysisService marketAnalysisService;

    // 상권 상세 분석 조회
    @GetMapping("/analysis")
    public ResponseEntity<MarketDetailResponse> getMarketAnalysis(
            @RequestParam("admCode") String admCode,
            @RequestParam("categoryId") Long categoryId) {

        MarketDetailResponse response = marketAnalysisService.getAnalysis(admCode, categoryId);
        return ResponseEntity.ok(response);
    }

    // 맞춤형 창업 순위 추천
    @PostMapping("/recommend")
    public ResponseEntity<List<StartupRankingResponse>> recommendStartup(
            @Valid @RequestBody MarketAnalysisRequest request) {
        List<StartupRankingResponse> rankings = marketAnalysisService.recommendStartups(request);
        return ResponseEntity.ok(rankings);
    }

    // 지도 데이터 조회용 DTO (MarketMapResponse) 생성 필요
    @GetMapping("/map-info")
    public ResponseEntity<List<MarketMapResponse>> getMapInfo(
            @RequestParam("province") String province,
            @RequestParam("categoryId") Long categoryId) {

        List<MarketMapResponse> mapInfo = marketAnalysisService.getMapInfo(province, categoryId);
        return ResponseEntity.ok(mapInfo);
    }

}