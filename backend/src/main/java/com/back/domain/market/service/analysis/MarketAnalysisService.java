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
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketAnalysisService {

    private final MarketStatsRepository marketStatsRepository;
    private final CategoryRepository categoryRepository;

    private static final double THRESHOLD_OPPORTUNITY = 500.0;
    private static final double THRESHOLD_OVERCROWDED = 50.0;
    private static final String BADGE_OPPORTUNITY = "기회";
    private static final String BADGE_OVERCROWDED = "과열";
    private static final String BADGE_NORMAL = "보통";

    // 상권 상세 분석
    @Cacheable(value = "marketAnalysis", key = "#admCode + '_' + #categoryId")
    public MarketDetailResponse getAnalysis(String admCode, Long categoryId) {
        MarketStats stats = marketStatsRepository.findByAdmCodeAndCategoryId(admCode,categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지역 및 업종에 대한 분석 데이터가 없습니다."));
        return MarketDetailResponse.from(stats);
    }

    // 점포당 고객 밀도가 널널한 지역과 업종 순위
    public List<StartupRankingResponse> getMarketRankings(MarketAnalysisRequest request) {
        List<MarketStats> statsList = fetchStats(request);

        List<MarketStats> topRankedStats = statsList.stream()
                .filter(stats -> stats.getStoreCount() > 0)
                .sorted(resolveComparator(request))
                .limit(10)
                .toList();

        return mapToRankingResponses(topRankedStats);
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

    private List<MarketStats> fetchStats(MarketAnalysisRequest request) {
        if (request.admCode() == null) {
            return marketStatsRepository.findAllWithDetails(); // 서울시 전체 순위 불러오기
        }
        return marketStatsRepository.findAllByRegionAdmCode(request.admCode());
    }

    private Comparator<MarketStats> resolveComparator(MarketAnalysisRequest request) {
        return switch (request.sortOption()) {
            case OPPORTUNITY -> (s1, s2) -> Double.compare(getPopPerStore(s2), getPopPerStore(s1)); // 내림차순
            case OVERCROWDED -> (s1, s2) -> Double.compare(getPopPerStore(s1), getPopPerStore(s2)); // 오름차순
            case POPULATION -> Comparator.comparingInt(MarketStats::getFloatingPopulation).reversed();
            case STORE_COUNT -> Comparator.comparingInt(MarketStats::getStoreCount).reversed();
        };
    }

    private List<StartupRankingResponse> mapToRankingResponses(List<MarketStats> statsList) {
        return IntStream.range(0, statsList.size())
                .mapToObj(index -> {
                    MarketStats stats = statsList.get(index);
                    double popPerStore = getPopPerStore(stats);
                    return new StartupRankingResponse(
                            index + 1,
                            stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict(),
                            stats.getCategory().getName(),
                            stats.getStoreCount(),
                            stats.getFloatingPopulation(),
                            Math.round(popPerStore * 10) / 10.0,
                            resolveBadge(popPerStore)
                    );
                })
                .toList();
    }

    private String resolveBadge(double popPerStore) {
        if (popPerStore >= THRESHOLD_OPPORTUNITY) return BADGE_OPPORTUNITY;
        if (popPerStore < THRESHOLD_OVERCROWDED) return BADGE_OVERCROWDED;
        return BADGE_NORMAL;
    }

}