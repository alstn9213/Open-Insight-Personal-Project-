package com.back.domain.auth.dto.response;

public record TokenResponse(
        String accessToken,
        String tokenType
) {
    public static TokenResponse from(String accessToken) {
        return new TokenResponse(accessToken, "Bearer");
    }
}
