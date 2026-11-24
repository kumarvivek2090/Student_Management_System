package com.studentreport.repository;

import com.studentreport.entity.ReportCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportCardRepository extends JpaRepository<ReportCard, UUID> {
    List<ReportCard> findByStudentId(UUID studentId);
    Optional<ReportCard> findByStudentIdAndAcademicYearIdAndSemesterId(UUID studentId, UUID academicYearId, UUID semesterId);

    @Query("SELECT r FROM ReportCard r " +
           "JOIN FETCH r.student s " +
           "JOIN FETCH s.user u " +
           "JOIN FETCH r.academicYear ay " +
           "JOIN FETCH r.semester sem " +
           "WHERE s.id = :studentId " +
           "ORDER BY sem.startDate DESC")
    List<ReportCard> findDetailedReportCardsByStudentId(@Param("studentId") UUID studentId);
}
