package com.studentreport.repository;

import com.studentreport.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    @Query("SELECT lr FROM LeaveRequest lr " +
           "JOIN FETCH lr.user u " +
           "LEFT JOIN FETCH lr.reviewedBy rb " +
           "LEFT JOIN FETCH lr.recommendedBy rec " +
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findAllWithDetails();

    @Query("SELECT lr FROM LeaveRequest lr " +
           "JOIN FETCH lr.user u " +
           "LEFT JOIN FETCH lr.reviewedBy rb " +
           "LEFT JOIN FETCH lr.recommendedBy rec " +
           "WHERE u.email = :email " +
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByUserEmailWithDetails(@Param("email") String email);

    @Query("SELECT lr FROM LeaveRequest lr " +
           "JOIN FETCH lr.user u " +
           "LEFT JOIN FETCH lr.reviewedBy rb " +
           "LEFT JOIN FETCH lr.recommendedBy rec " +
           "WHERE lr.role = 'STUDENT' AND u.id IN (" +
           "    SELECT s.user.id FROM Student s " +
           "    WHERE s.schoolClass.id IN (" +
           "        SELECT ta.schoolClass.id FROM TeacherAssignment ta WHERE ta.teacher.user.email = :teacherEmail" +
           "    )" +
           ") " +
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findStudentLeavesForTeacher(@Param("teacherEmail") String teacherEmail);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus status);

    long countByStatus(LeaveRequest.LeaveStatus status);

    long countByRole(String role);

    long countByRoleAndStatus(String role, LeaveRequest.LeaveStatus status);
}
