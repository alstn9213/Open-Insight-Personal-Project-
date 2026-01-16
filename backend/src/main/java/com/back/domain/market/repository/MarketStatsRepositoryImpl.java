package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import static com.back.domain.market.entity.QMarketStats.marketStats;
import static com.back.domain.category.entity.QCategory.category;
import static com.back.domain.region.entity.QRegion.region;

@RequiredArgsConstructor
public class MarketStatsRepositoryImpl implements MarketStatsRepositoryCustom {

   private final JPAQueryFactory queryFactory;


    @Override
    public Optional<MarketStats> findByAdmCodeAndCategoryId(String admCode, Long categoryId) {
        MarketStats result = queryFactory
                .selectFrom(marketStats)
                .join(marketStats.region, region).fetchJoin()
                .join(marketStats.category, category).fetchJoin()
                .where(
                        region.admCode.eq(admCode),
                        category.id.eq(categoryId)
                )
                .fetchOne();
        return Optional.ofNullable(result);
    }

    @Override
    public List<MarketStats> findAllByProvinceAndCategoryId(String province, Long categoryId) {
        return queryFactory
                .selectFrom(marketStats)
                .join(marketStats.region, region).fetchJoin()
                .join(marketStats.category, category).fetchJoin()
                .where(
                        region.province.eq(province),
                        category.id.eq(categoryId)
                )
                .fetch();
    }
    
}
