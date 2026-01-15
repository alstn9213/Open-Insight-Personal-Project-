package com.back.domain.market.error.exception;

import com.back.global.error.ErrorCode;
import com.back.global.error.exception.BusinessException;

public class MarketAnalysisNotFoundException extends BusinessException {
    public MarketAnalysisNotFoundException() {
        super(ErrorCode.MARKET_NOT_FOUND);
    }
}
