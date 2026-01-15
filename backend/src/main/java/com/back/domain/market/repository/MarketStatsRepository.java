package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketStatsRepository extends JpaRepository<MarketStats, Long>, MarketStatsRepositoryCustom {
    
}
