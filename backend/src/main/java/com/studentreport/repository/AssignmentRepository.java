package com.studentreport.repository;

import com.studentreport.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    @Query("SELECT a FROM Assignment a " +
           "JOIN FETCH a.schoolClass c " +
           "JOIN FETCH a.section s " +
           "JOIN FETCH a.subject sub " +
           "JOIN FETCH a.teacher t " +
           "JOIN FETCH t.user u " +
           "WHERE a.schoolClass.id = :classId AND a.section.id = :sectionId " +
           "ORDER BY a.dueDate DESC")
    List<Assignment> findByClassIdAndSectionIdWithDetails(@Param("classId") UUID classId, @Param("sectionId") UUID sectionId);

    @Query("SELECT a FROM Assignment a " +
           "JOIN FETCH a.schoolClass c " +
           "JOIN FETCH a.section s " +
           "JOIN FETCH a.subject sub " +
           "JOIN FETCH a.teacher t " +
           "JOIN FETCH t.user u " +
           "WHERE u.email = :teacherEmail " +
           "ORDER BY a.dueDate DESC")
    List<Assignment> findByTeacherEmailWithDetails(@Param("teacherEmail") String teacherEmail);

    @Query("SELECT a FROM Assignment a " +
           "JOIN FETCH a.schoolClass c " +
           "JOIN FETCH a.section s " +
           "JOIN FETCH a.subject sub " +
           "JOIN FETCH a.teacher t " +
           "JOIN FETCH t.user u " +
           "ORDER BY a.dueDate DESC")
    List<Assignment> findAllWithDetails();
}
