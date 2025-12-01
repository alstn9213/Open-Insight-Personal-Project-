package com.back.repository;

import com.back.domain.franchise.Franchise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FranchiseRepository extends JpaRepository<Franchise, Long> {
    List<Franchise> findByCategoryId(Long categoryId);
}