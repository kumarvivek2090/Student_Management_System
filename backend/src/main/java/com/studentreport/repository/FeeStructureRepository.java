package com.studentreport.repository;

import com.studentreport.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, UUID> {
    List<FeeStructure> findByAcademicYearIdOrderByDueDateAsc(UUID academicYearId);
    List<FeeStructure> findBySchoolClassIdOrderByDueDateAsc(UUID classId);
}
