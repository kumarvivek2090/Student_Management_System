package com.studentreport.repository;

import com.studentreport.entity.TeacherRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherRemarkRepository extends JpaRepository<TeacherRemark, UUID> {
    List<TeacherRemark> findByStudentId(UUID studentId);
    List<TeacherRemark> findByStudentIdAndIsPublishedTrue(UUID studentId);

    @Query("SELECT r FROM TeacherRemark r " +
           "JOIN FETCH r.teacher t " +
           "JOIN FETCH t.user tu " +
           "LEFT JOIN FETCH r.subject s " +
           "WHERE r.student.id = :studentId " +
           "ORDER BY r.createdAt DESC")
    List<TeacherRemark> findAllByStudentWithDetails(@Param("studentId") UUID studentId);

    @Query("SELECT r FROM TeacherRemark r " +
           "JOIN FETCH r.teacher t " +
           "JOIN FETCH t.user tu " +
           "LEFT JOIN FETCH r.subject s " +
           "WHERE r.student.id = :studentId AND r.isPublished = true " +
           "ORDER BY r.createdAt DESC")
    List<TeacherRemark> findPublishedByStudentWithDetails(@Param("studentId") UUID studentId);
}
