package com.back.domain.market.service.analysis;

import com.back.domain.market.dto.request.MarketAnalysisRequest;
import com.back.domain.market.dto.request.MarketAnalysisRequest.WeightOption;
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
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketAnalysisService {

    private final MarketStatsRepository marketStatsRepository;

    // 상권 상세 분석
    @Cacheable(value = "marketAnalysis", key = "#admCode + '_' + #categoryId")
    public MarketDetailResponse getAnalysis(String admCode, Long categoryId) {
        MarketStats stats = marketStatsRepository.findByAdmCodeAndCategoryId(admCode,categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지역 및 업종에 대한 분석 데이터가 없습니다."));
        return MarketDetailResponse.from(stats);
    }

    // 창업 추천 순위
    @Transactional(readOnly = true)
    public List<StartupRankingResponse> recommendStartups(MarketAnalysisRequest request) {
        List<MarketStats> allStats = marketStatsRepository.findAllByRegionAdmCode(request.admCode());
        WeightOption weights = request.weightOption();

        List<MarketScoreResult> topRankedMarkets = allStats.stream()
                .map(stats -> new MarketScoreResult(
                        stats,
                        calculateScore(stats, weights),
                        determineBadge(stats)
                ))
                .sorted(Comparator.comparingDouble(MarketScoreResult::score).reversed())
                .limit(10)
                .toList();

        return IntStream.range(0, topRankedMarkets.size())
                .mapToObj(index -> {
                    MarketScoreResult result = topRankedMarkets.get(index);
                    return StartupRankingResponse.of(
                            index + 1,
                            result.stats(),
                            result.score(),
                            result.badge()
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

    /**
     * 내부에서만 사용하는 중간 데이터용 레코드 (Java 17 기능)
     * - 통계 데이터와 계산된 점수, 뱃지를 묶어서 관리
     */
    private record MarketScoreResult(MarketStats stats, double score, String badge) {}

   // --- 내부 메서드 ---

    private double calculateScore(MarketStats stats, MarketAnalysisRequest.WeightOption weights) {
        double salesScore = (stats.getAverageSales() / 10000.0);

        // 유동인구가 많으면 가산점(1000명당 1점)
        double populationBonus = (stats.getFloatingPopulation() != null)
                ? (stats.getFloatingPopulation() / 1000.0) * 0.1
                : 0.0;

        double score = (salesScore * weights.salesWeight())
                - (stats.getClosingRate() * weights.stabilityWeight() * 100) // 폐업률 비중 증폭
                + (stats.getGrowthRate() * weights.growthWeight())
                + populationBonus;

        return Math.max(score, 0.0); // 점수가 음수가 나오지 않도록 보정
    }

    private String determineBadge(MarketStats stats) {
        // 기준값 설정 (실제 서비스에서는 전체 데이터의 평균/표준편차를 구해 동적으로 설정하는 것이 좋음)
        // THRESHOLD: 임계값, 기준값
        double HIGH_SALES_THRESHOLD = 50000000; // 월 매출 5천만원 이상
        double LOW_CLOSING_RATE_THRESHOLD = 2.0; // 폐업률 2% 미만
        double HIGH_GROWTH_RATE_THRESHOLD = 5.0; // 성장률 5% 이상
        int HOT_PLACE_POPULATION = 50000;

        if (stats.getFloatingPopulation() != null && stats.getFloatingPopulation() >= HOT_PLACE_POPULATION) return "핫플레이스";
        if (stats.getAverageSales() >= HIGH_SALES_THRESHOLD) return "수익성 BEST";
        if (stats.getClosingRate() <= LOW_CLOSING_RATE_THRESHOLD) return "안전성 BEST";
        if (stats.getGrowthRate() >= HIGH_GROWTH_RATE_THRESHOLD) return "뜨는 상권";
        return null;
    }
}