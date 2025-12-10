package com.back.domain.market.repository;

import com.back.domain.market.entity.MarketStats;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.back.domain.market.entity.QMarketStats.marketStats;

@Repository
@RequiredArgsConstructor
public class MarketStatsRepositoryImpl implements MarketStatsRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<MarketStats> searchMarket(String province, Long categoryId, Long minSales) {
        return queryFactory
                .selectFrom(marketStats)
                .join(marketStats.region).fetchJoin()
                .join(marketStats.category).fetchJoin()
                .where(
                        eqProvince(province),
                        eqCategory(categoryId),
                        goeSales(minSales)
                )
                .fetch();
    }

    private BooleanExpression eqProvince(String province) {
        return province != null
                ? marketStats.region.province.eq(province)
                : null;
    }

    private BooleanExpression eqCategory(Long categoryId) {
        return categoryId != null
                ? marketStats.category.id.eq(categoryId)
                : null;
    }

    private BooleanExpression goeSales(Long minSales) {
        return minSales != null
                ? marketStats.averageSales.goe(minSales)
                : null;
    }
}
