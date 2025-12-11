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

        return allStats.stream()
                .map(stats -> {
                    double totalScore = calculateScore(stats, weights);
                    String badge = determineBadge(stats);

                    return new StartupRankingResponse(
                            0, // 순위는 나중에 정렬 후 매김
                            stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict(),
                            stats.getCategory().getName(),
                            Math.round(totalScore * 10) / 10.0, // 소수점 첫째 자리까지 반올림
                            badge
                    );
                })
                .sorted(Comparator.comparingDouble(StartupRankingResponse::totalScore).reversed())
                .limit(10) // 상위 10개
                .map(response -> new StartupRankingResponse(
                        // 랭킹 번호 매기기는 리스트 인덱스를 활용하거나 여기서 재매핑 필요하지만,
                        // 스트림 특성상 외부 변수 제어가 까다로우므로 아래에서 리스트로 만든 후 처리하는 것이 좋다.
                        // 여기서는 임시로 0으로 두고 반환.
                        0,
                        response.regionName(),
                        response.categoryName(),
                        response.totalScore(),
                        response.badge()
                ))
                .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                    // 리스트가 생성된 후 순위(rank) 번호 부여
                    AtomicInteger rank = new AtomicInteger(1);
                    return list.stream()
                            .map(r -> new StartupRankingResponse(
                                    rank.getAndIncrement(),
                                    r.regionName(),
                                    r.categoryName(),
                                    r.totalScore(),
                                    r.badge()
                            ))
                            .toList();
                }));
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