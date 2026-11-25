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
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findAllWithDetails();

    @Query("SELECT lr FROM LeaveRequest lr " +
           "JOIN FETCH lr.user u " +
           "WHERE u.email = :email " +
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByUserEmailWithDetails(@Param("email") String email);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus status);
}
