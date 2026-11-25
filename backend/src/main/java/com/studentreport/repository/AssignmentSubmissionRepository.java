package com.studentreport.repository;

import com.studentreport.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    @Query("SELECT s FROM AssignmentSubmission s " +
           "JOIN FETCH s.assignment a " +
           "JOIN FETCH s.student st " +
           "JOIN FETCH st.user u " +
           "WHERE a.id = :assignmentId")
    List<AssignmentSubmission> findByAssignmentIdWithDetails(@Param("assignmentId") UUID assignmentId);

    @Query("SELECT s FROM AssignmentSubmission s " +
           "JOIN FETCH s.assignment a " +
           "JOIN FETCH a.subject sub " +
           "JOIN FETCH s.student st " +
           "JOIN FETCH st.user u " +
           "WHERE u.email = :studentEmail " +
           "ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByStudentEmailWithDetails(@Param("studentEmail") String studentEmail);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);
}
