package com.back.domain.market.service.analysis;

import com.back.domain.category.repository.CategoryRepository;
import com.back.domain.market.error.exception.MarketAnalysisNotFoundException;
import com.back.domain.market.repository.MarketStatsRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketAnalysisServiceTest {

    @Mock
    private MarketStatsRepository marketStatsRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private MarketAnalysisService marketAnalysisService;

    @Test
    @DisplayName("getAnalysis - 데이터 없음 예외 테스트")
    void getAnalysis_throw_exception_when_data_not_found() {
        // given
        when(marketStatsRepository.findByAdmCodeAndCategoryId(any(), any()))
                .thenReturn(Optional.empty());

        // when & then
        assertThrows(MarketAnalysisNotFoundException.class, () -> {
            marketAnalysisService.getAnalysis("someCode", 1L);
        });
    }

    @Test
    @DisplayName("getMapInfo - 데이터 없음 예외 테스트")
    void getMapInfo_throw_exception_when_data_not_found() {
        // given
        when(marketStatsRepository.findAllByProvinceAndCategoryId(any(), any()))
                .thenReturn(Collections.emptyList());

        // when & then
        assertThrows(MarketAnalysisNotFoundException.class, () -> {
            marketAnalysisService.getMapInfo("someProvince", 1L);
        });
    }
}
