package com.studentreport.repository;

import com.studentreport.entity.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, UUID> {
    List<Examination> findByAcademicYearIdAndSemesterId(UUID academicYearId, UUID semesterId);
    List<Examination> findByAcademicYearId(UUID academicYearId);
}
