package com.studentreport.repository;

import com.studentreport.entity.ParentStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParentStudentRepository extends JpaRepository<ParentStudent, UUID> {
    List<ParentStudent> findByParentId(UUID parentId);
    List<ParentStudent> findByStudentId(UUID studentId);

    @Query("SELECT ps FROM ParentStudent ps " +
           "JOIN FETCH ps.student s " +
           "JOIN FETCH s.user su " +
           "LEFT JOIN FETCH s.schoolClass " +
           "LEFT JOIN FETCH s.section " +
           "WHERE ps.parent.user.email = :parentEmail")
    List<ParentStudent> findByParentUserEmail(@Param("parentEmail") String parentEmail);

    boolean existsByParentUserEmailAndStudentId(String parentEmail, UUID studentId);
}
