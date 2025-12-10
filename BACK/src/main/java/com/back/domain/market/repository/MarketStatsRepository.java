package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MarketStatsRepository extends JpaRepository<MarketStats, Long> {
    // 1. 특정 지역(admCode)과 업종(categoryId)으로 상권 통계 상세 조회
    // N+1 문제를 방지하기 위해 Region과 Category를 Fetch Join으로 한 번에 가져옵니다.
    @Query("SELECT m FROM MarketStats m " +
            "JOIN FETCH m.region r " +
            "JOIN FETCH m.category c " +
            "WHERE r.admCode = :admCode AND c.id = :categoryId")
    Optional<MarketStats> findByAdmCodeAndCategoryId(@Param("admCode") String admCode,
                                                     @Param("categoryId") Long categoryId);

    // 2. 특정 지역의 모든 업종 통계 조회 (예: 해당 지역에서 가장 뜨는 업종 찾기)
    @Query("SELECT m FROM MarketStats m " +
            "JOIN FETCH m.category c " +
            "WHERE m.region.admCode = :admCode")
    List<MarketStats> findAllByRegionAdmCode(@Param("admCode") String admCode);

    // 3. 전체 데이터 조회 시에도 성능을 위해 Fetch Join 사용 (랭킹 알고리즘용)
    // 데이터 양이 많다면 Paging 처리가 필요할 수 있습니다.
    @Query("SELECT m FROM MarketStats m " +
            "JOIN FETCH m.region r " +
            "JOIN FETCH m.category c")
    List<MarketStats> findAllWithDetails();

    @Query("SELECT m FROM MarketStats m " +
            "JOIN FETCH m.region r " +
            "WHERE r.province = :province AND m.category.id = :categoryId")
    List<MarketStats> findAllByProvinceAndCategoryId(@Param("province") String province,
                                                     @Param("categoryId") Long categoryId);
}
