package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MarketStatsRepository extends JpaRepository<MarketStats, Long>, MarketStatsRepositoryCustom {
    // 1. 특정 지역(admCode)과 업종(categoryId)으로 상권 통계 상세 조회
    // N+1 문제를 방지하기 위해 Region과 Category를 Fetch Join으로 한 번에 가져옵니다.
    @Query("SELECT m FROM MarketStats m " +
            "JOIN FETCH m.region r " +
            "JOIN FETCH m.category c " +
            "WHERE r.admCode = :admCode AND c.id = :categoryId")
    Optional<MarketStats> findByAdmCodeAndCategoryId(@Param("admCode") String admCode,
                                                     @Param("categoryId") Long categoryId);

       @Query("SELECT m FROM MarketStats m " +
            "JOIN FETCH m.region r " +
            "WHERE r.province = :province AND m.category.id = :categoryId")
    List<MarketStats> findAllByProvinceAndCategoryId(@Param("province") String province,
                                                     @Param("categoryId") Long categoryId);
}
