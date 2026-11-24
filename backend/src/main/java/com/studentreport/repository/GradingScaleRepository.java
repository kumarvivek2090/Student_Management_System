package com.studentreport.repository;

import com.studentreport.entity.GradingScale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GradingScaleRepository extends JpaRepository<GradingScale, UUID> {
    List<GradingScale> findByIsActiveTrueOrderByMinPercentageDesc();
    Optional<GradingScale> findByGrade(String grade);

    @Query("SELECT g FROM GradingScale g " +
           "WHERE g.isActive = true " +
           "AND :percentage >= g.minPercentage AND :percentage <= g.maxPercentage")
    Optional<GradingScale> findGradeForPercentage(@Param("percentage") BigDecimal percentage);
}
