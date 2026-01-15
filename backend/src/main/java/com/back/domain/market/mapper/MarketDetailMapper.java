package com.back.domain.market.mapper;

import com.back.domain.market.dto.response.MarketDetailResponse;
import com.back.domain.market.entity.MarketStats;
import org.springframework.stereotype.Component;

@Component
public class MarketDetailMapper {

  public MarketDetailResponse toDetailResponse(MarketStats stats) {
    double popPerStore = (stats.getStoreCount() > 0)
            ? (double) stats.getFloatingPopulation() / stats.getStoreCount()
            : 0.0;
    int totalPop = stats.getFloatingPopulation();
    int malePer = 0;
    int femalePer = 0;

    if (totalPop > 0) {
        malePer = (int) Math.round(((double) stats.getMalePopulation() / totalPop) * 100);
        femalePer = 100 - malePer;
    }

    String regionName = stats.getRegion().getProvince() + " " + stats.getRegion().getDistrict() + " " + stats.getRegion().getTown();
    String ageGroup = stats.getAgeGroup() != null ? stats.getAgeGroup() : "분석중";

    return new MarketDetailResponse(
            stats.getId(),
            regionName,
            stats.getCategory().getName(),
            stats.getStoreCount(),
            stats.getFloatingPopulation(),
            Math.round(popPerStore * 10) / 10.0,
            stats.getMarketGrade(),
            stats.getMarketGrade().getDescription(),
            malePer,
            femalePer,
            ageGroup
    );
  }
}
