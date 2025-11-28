package com.back.domain.region;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "regions")
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "region_id")
    private Long id;

    // 예: "서울특별시", "부산광역시"
    @Column(nullable = false)
    private String province;

    // 예: "강남구", "해운대구"
    @Column(nullable = false)
    private String district;

    // 행정동 코드 (공공데이터 연동용)
    private String admCode;

}