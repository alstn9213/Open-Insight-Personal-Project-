package com.back.api;

import com.back.domain.category.entity.Category;
import com.back.domain.market.dto.response.MarketDetailResponse;
import com.back.domain.market.dto.response.MarketMapResponse;
import com.back.domain.market.service.MarketAnalysisService;
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
            @RequestParam("categoryId") Long categoryId
    ) {
        MarketDetailResponse response = marketAnalysisService.getAnalysis(admCode, categoryId);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/map-info")
    public ResponseEntity<List<MarketMapResponse>> getMapInfo(
            @RequestParam("province") String province,
            @RequestParam("categoryId") Long categoryId
    ) {
        List<MarketMapResponse> mapInfo = marketAnalysisService.getMapInfo(province, categoryId);
        return ResponseEntity.ok(mapInfo);
    }

    // 업종 목록 조회
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(marketAnalysisService.getAllCategories());
    }

}