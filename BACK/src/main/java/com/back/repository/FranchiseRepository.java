package com.back.repository;

import com.back.domain.franchise.Franchise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FranchiseRepository extends JpaRepository<Franchise, Long> {
    // 특정 업종의 프랜차이즈 찾기 등
    List<Franchise> findByCategoryId(Long categoryId);
}