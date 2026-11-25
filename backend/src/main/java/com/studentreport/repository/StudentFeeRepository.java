package com.studentreport.repository;

import com.studentreport.entity.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, UUID> {

    @Query("SELECT sf FROM StudentFee sf " +
           "JOIN FETCH sf.student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH sf.feeStructure fs " +
           "ORDER BY sf.dueDate DESC")
    List<StudentFee> findAllWithDetails();

    @Query("SELECT sf FROM StudentFee sf " +
           "JOIN FETCH sf.student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH sf.feeStructure fs " +
           "WHERE s.id = :studentId " +
           "ORDER BY sf.dueDate DESC")
    List<StudentFee> findByStudentIdWithDetails(@Param("studentId") UUID studentId);

    @Query("SELECT sf FROM StudentFee sf " +
           "JOIN FETCH sf.student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH sf.feeStructure fs " +
           "WHERE u.email = :email " +
           "ORDER BY sf.dueDate DESC")
    List<StudentFee> findByStudentEmailWithDetails(@Param("email") String email);

    Optional<StudentFee> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT COALESCE(SUM(sf.totalAmount), 0) FROM StudentFee sf")
    BigDecimal sumTotalBilled();

    @Query("SELECT COALESCE(SUM(sf.paidAmount), 0) FROM StudentFee sf")
    BigDecimal sumTotalCollected();

    @Query("SELECT COALESCE(SUM(sf.totalAmount - sf.paidAmount), 0) FROM StudentFee sf WHERE sf.status <> 'PAID'")
    BigDecimal sumPendingDues();
}
