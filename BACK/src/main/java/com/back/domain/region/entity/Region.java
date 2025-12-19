package com.back.domain.region.entity;

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

    @Column(nullable = false)
    private String province;  // 시

    @Column(nullable = false)
    private String district; // 구

    @Column(nullable = false)
    private String town; // 동

    @Column(name = "adm_code", unique = true)
    private String admCode;

}