package com.studentreport.repository;

import com.studentreport.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByStudentId(UUID studentId);
    List<AttendanceRecord> findByStudentIdAndAttendanceDateBetween(UUID studentId, LocalDate start, LocalDate end);

    @Query("SELECT a FROM AttendanceRecord a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH a.recordedBy r " +
           "WHERE a.schoolClass.id = :classId AND a.section.id = :sectionId AND a.attendanceDate = :date " +
           "ORDER BY s.rollNumber ASC")
    List<AttendanceRecord> findByClassSectionAndDate(
            @Param("classId") UUID classId,
            @Param("sectionId") UUID sectionId,
            @Param("date") LocalDate date
    );

    @Query("SELECT a FROM AttendanceRecord a " +
           "WHERE a.student.id = :studentId " +
           "AND a.schoolClass.id = :classId " +
           "AND a.section.id = :sectionId " +
           "AND a.attendanceDate = :date " +
           "AND ((cast(:subjectId as uuid) IS NULL AND a.subject IS NULL) OR (a.subject.id = :subjectId))")
    Optional<AttendanceRecord> findExistingRecord(
            @Param("studentId") UUID studentId,
            @Param("classId") UUID classId,
            @Param("sectionId") UUID sectionId,
            @Param("date") LocalDate date,
            @Param("subjectId") UUID subjectId
    );

    long countByStudentId(UUID studentId);
    long countByStudentIdAndStatus(UUID studentId, AttendanceRecord.AttendanceStatus status);
}
