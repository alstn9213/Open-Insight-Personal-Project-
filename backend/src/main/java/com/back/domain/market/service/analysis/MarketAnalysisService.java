package com.back.domain.market.service.analysis;

import com.back.domain.category.entity.Category;
import com.back.domain.category.repository.CategoryRepository;
import com.back.domain.market.dto.request.MarketAnalysisRequest;
import com.back.domain.market.entity.MarketStats;
import com.back.domain.market.dto.response.MarketDetailResponse;
import com.back.domain.market.dto.response.MarketMapResponse;
import com.back.domain.market.dto.response.StartupRankingResponse;
import com.back.domain.market.repository.MarketStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

    // 점포당 고객 밀도가 널널한 지역과 업종 순위
    @Transactional(readOnly = true)
    public List<StartupRankingResponse> getMarketRankings(MarketAnalysisRequest request) {
        List<MarketStats> allStats;

        // 사용자가 아무런 필터를 선택하지 않았을 때,
        if(request.admCode() == null) {
            allStats = marketStatsRepository.findAllWithDetails(); // 서울시 전체 순위 불러오기
        } else {
            allStats = marketStatsRepository.findAllByRegionAdmCode(request.admCode());
        }

        Stream<MarketStats> stream = allStats.stream()
                .filter(stats -> stats.getStoreCount() > 0); // 기본 필터링

        stream = switch (request.sortOption()) {
            case OPPORTUNITY -> stream.sorted((s1, s2) -> Double.compare(getPopPerStore(s2), getPopPerStore(s1))); // 내림차순
            case OVERCROWDED -> stream.sorted((s1, s2) -> Double.compare(getPopPerStore(s1), getPopPerStore(s2))); // 오름차순
            case POPULATION  -> stream.sorted(Comparator.comparingInt(MarketStats::getFloatingPopulation).reversed());
            case STORE_COUNT -> stream.sorted(Comparator.comparingInt(MarketStats::getStoreCount).reversed());
        };

        return stream.limit(10)
                .map(stats -> {
                    double popPerStore = (double) stats.getFloatingPopulation() / Math.max(stats.getStoreCount(), 1);
                    String badge = "보통";
                    if(popPerStore >= 500.0) badge = "기회";
                    else if(popPerStore < 50.0) badge = "과열";

                    return new StartupRankingResponse(
                            0, // 순위: 여기서는 알 수 없으므로 0으로 두고, 리스트 반환 후 인덱스를 매기거나 클라이언트에서 처리
                            stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict(),
                            stats.getCategory().getName(),
                            stats.getStoreCount(),
                            stats.getFloatingPopulation(),
                            Math.round(popPerStore * 10) / 10.0,
                            badge
                    );
                })
                .toList();
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

    // --- 내부 메서드 ---
    private double getPopPerStore(MarketStats stats) {
        return (double) stats.getFloatingPopulation() / Math.max(stats.getStoreCount(), 1);
    }

}