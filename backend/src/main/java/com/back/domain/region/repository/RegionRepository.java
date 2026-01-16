package com.back.domain.region.repository;

import com.back.domain.region.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;


public interface RegionRepository extends JpaRepository<Region,Long> {
}
