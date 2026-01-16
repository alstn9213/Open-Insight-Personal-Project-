package com.back.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // Common
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C001", "서버 내부 오류입니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C002", "잘못된 입력입니다."),

    // Market
    MARKET_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "해당 지역 및 업종에 대한 분석 데이터가 없습니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;
}
