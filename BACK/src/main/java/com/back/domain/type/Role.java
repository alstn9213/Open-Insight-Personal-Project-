package com.back.domain.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {

    // 스프링 시큐리티는 기본적으로 권한 이름 앞에 "ROLE_" 접두사
    USER("ROLE_USER", "일반 회원"),
    ADMIN("ROLE_ADMIN", "관리자");

    private final String key;
    private final String title;
}