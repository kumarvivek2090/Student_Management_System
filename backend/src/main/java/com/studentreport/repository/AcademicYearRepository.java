package com.studentreport.repository;

import com.studentreport.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
    Optional<AcademicYear> findByName(String name);
    Optional<AcademicYear> findByIsCurrentTrue();
}
