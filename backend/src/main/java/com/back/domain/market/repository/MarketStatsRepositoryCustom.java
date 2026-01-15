package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;

import java.util.List;
import java.util.Optional;

public interface MarketStatsRepositoryCustom {
    Optional<MarketStats> findByAdmCodeAndCategoryId(String admCode, Long categoryId);

    List<MarketStats> findAllByProvinceAndCategoryId(String province, Long categoryId);
    

}
