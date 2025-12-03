package com.back.service.analysis;

import com.back.domain.market.MarketStats;
import com.back.dto.request.MarketAnalysisRequest;
import com.back.dto.response.MarketDetailResponse;
import com.back.dto.response.StartupRankingResponse;
import com.back.repository.MarketStatsRepository;
import lombok.RequiredArgsConstructor;
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

    // 상권 상세 분석 (신호등 데이터)
    public MarketDetailResponse getMarketDetail(String admCode, Long categoryId) {
        MarketStats stats = marketStatsRepository.findByAdmCodeAndCategoryId(admCode, categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지역/업종의 데이터가 없습니다."));
        return MarketDetailResponse.from(stats);
    }

    public MarketDetailResponse getAnalysis(String admCode, Long categoryId) {
        MarketStats stats = marketStatsRepository.findByAdmCodeAndCategoryId(admCode,categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지역 및 업종에 대한 분석 데이터가 없습니다."));
        return MarketDetailResponse.from(stats);
    }

    // 창업 추천 순위
    @Transactional(readOnly = true)
    public List<StartupRankingResponse> recommendStartups(MarketAnalysisRequest request) {
        List<MarketStats> allStats = marketStatsRepository.findAllByRegionAdmCode(request.admCode());
        MarketAnalysisRequest.WeightOption weights = request.weightOption();

        return allStats.stream()
                .map(stats -> {
                    double totalScore = calculateScore(stats, weights);
                    String badge = determineBadge(stats, totalScore);

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

    private double calculateScore(MarketStats stats, MarketAnalysisRequest.WeightOption weights) {
        double salesScore = (stats.getAverageSales() / 10000.0);

        double score = (salesScore * weights.salesWeight())
                - (stats.getClosingRate() * weights.stabilityWeight() * 100) // 폐업률 비중 증폭
                + (stats.getGrowthRate() * weights.growthWeight());

        return Math.max(score, 0.0); // 점수가 음수가 나오지 않도록 보정
    }
    /**
     * [내부 메서드] 뱃지 부여 로직
     * 통계 수치의 특정 임계값을 넘으면 뱃지를 부여합니다.
     */
    private String determineBadge(MarketStats stats, double totalScore) {
        // 기준값 설정 (실제 서비스에서는 전체 데이터의 평균/표준편차를 구해 동적으로 설정하는 것이 좋음), THRESHOLD (임계값, 기준값)
        double HIGH_SALES_THRESHOLD = 50000000; // 월 매출 5천만원 이상
        double LOW_CLOSING_RATE_THRESHOLD = 2.0; // 폐업률 2% 미만
        double HIGH_GROWKp_RATE_THRESHOLD = 5.0; // 성장률 5% 이상

        if (stats.getAverageSales() >= HIGH_SALES_THRESHOLD) {
            return "수익성 BEST";
        }

        if (stats.getClosingRate() <= LOW_CLOSING_RATE_THRESHOLD) {
            return "안전성 BEST";
        }

        if (stats.getGrowthRate() >= HIGH_GROWKp_RATE_THRESHOLD) {
            return "뜨는 상권";
        }
        // 특별한 강점이 없으면 null 반환 (프론트에서 렌더링 안 함)
        return null;
    }
}