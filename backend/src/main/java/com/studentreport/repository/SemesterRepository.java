package com.studentreport.repository;

import com.studentreport.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    List<Semester> findByAcademicYearId(UUID academicYearId);
    Optional<Semester> findByAcademicYearIdAndIsCurrentTrue(UUID academicYearId);
    Optional<Semester> findByIsCurrentTrue();
}
