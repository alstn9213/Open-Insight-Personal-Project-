package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;

import java.util.List;

public interface MarketStatsRepositoryCustom {

    List<MarketStats> searchMarket(String province, Long categoryId, Long minSales);

}
