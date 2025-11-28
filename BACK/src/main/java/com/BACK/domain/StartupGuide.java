package com.BACK.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "startup_guides")
public class StartupGuide {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "guide_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // 가이드 제목
    private String title;

    // 내용 (긴 텍스트 - MySQL의 TEXT/LONGTEXT 타입 매핑)
    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    // 핵심 팁 요약
    private String keyTips;
}