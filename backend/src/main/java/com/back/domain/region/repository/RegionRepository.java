package com.back.domain.region.repository;

import com.back.domain.region.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region,Long> {
    // 행정동 코드로 지역 정보 찾기 (API 요청 검증용)
    Optional<Region> findByAdmCode(String admCode);

    // 시/도(Province) 목록 조회 (예: "서울특별시", "경기도") - 중복 제거
    // SQL: SELECT DISTINCT province FROM regions
    List<Region> findDistinctByProvince(String province);

    // 특정 시/도에 속한 구/군(District) 목록 조회 (예: "강남구", "서초구")
    List<Region> findAllByProvince(String province);
}
