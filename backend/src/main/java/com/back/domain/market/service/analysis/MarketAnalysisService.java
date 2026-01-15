package com.back.domain.market.service.analysis;

import com.back.domain.category.entity.Category;
import com.back.domain.category.repository.CategoryRepository;
import com.back.domain.market.entity.MarketStats;
import com.back.domain.market.dto.response.MarketDetailResponse;
import com.back.domain.market.dto.response.MarketMapResponse;
import com.back.domain.market.repository.MarketStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketAnalysisService {

    private final MarketStatsRepository marketStatsRepository;
    private final CategoryRepository categoryRepository;

    // 상권 상세 분석
    @Cacheable(value = "marketAnalysis", key = "#admCode + '_' + #categoryId")
    public MarketDetailResponse getAnalysis(String admCode, Long categoryId) {
        MarketStats stats = marketStatsRepository.findByAdmCodeAndCategoryId(admCode,categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지역 및 업종에 대한 분석 데이터가 없습니다."));
        return MarketDetailResponse.from(stats);
    }


    /**
     * 지도 시각화용 데이터 조회 (Key: province + categoryId)
     * 특정 광역자치단체(province) 내의 모든 구/군별 통계 데이터를 반환합니다.
     * 데이터 양이 많아(List) DB 부하가 큰 작업이므로 캐싱 효과가 큼
     */
    @Cacheable(value = "marketMap", key = "#province + '_' + #categoryId")
    public List<MarketMapResponse> getMapInfo(String province, Long categoryId) {
        List<MarketStats> statsList = marketStatsRepository.findAllByProvinceAndCategoryId(province, categoryId);

        return statsList.stream()
                .map(MarketMapResponse::from)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "categories", key = "'all'")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    
}