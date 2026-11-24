package com.studentreport.repository;

import com.studentreport.entity.AssessmentMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentMarkRepository extends JpaRepository<AssessmentMark, UUID> {
    List<AssessmentMark> findByAssessmentId(UUID assessmentId);
    List<AssessmentMark> findByStudentId(UUID studentId);
    Optional<AssessmentMark> findByAssessmentIdAndStudentId(UUID assessmentId, UUID studentId);

    @Query("SELECT m FROM AssessmentMark m " +
           "JOIN FETCH m.assessment a " +
           "JOIN FETCH a.examination e " +
           "JOIN FETCH e.academicYear ay " +
           "JOIN FETCH e.semester sem " +
           "JOIN FETCH a.subject s " +
           "WHERE m.student.id = :studentId " +
           "ORDER BY a.assessmentDate DESC")
    List<AssessmentMark> findDetailedMarksByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT m FROM AssessmentMark m " +
           "JOIN FETCH m.student s " +
           "JOIN FETCH s.user u " +
           "WHERE m.assessment.id = :assessmentId " +
           "ORDER BY s.rollNumber ASC")
    List<AssessmentMark> findByAssessmentIdWithStudent(@Param("assessmentId") UUID assessmentId);
}
