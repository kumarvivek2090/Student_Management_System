package com.studentreport.repository;

import com.studentreport.entity.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, UUID> {

    @Query("SELECT m FROM LearningMaterial m " +
           "JOIN FETCH m.schoolClass c " +
           "JOIN FETCH m.subject sub " +
           "JOIN FETCH m.uploadedBy t " +
           "JOIN FETCH t.user u " +
           "WHERE m.schoolClass.id = :classId " +
           "ORDER BY m.createdAt DESC")
    List<LearningMaterial> findByClassIdWithDetails(@Param("classId") UUID classId);

    @Query("SELECT m FROM LearningMaterial m " +
           "JOIN FETCH m.schoolClass c " +
           "JOIN FETCH m.subject sub " +
           "JOIN FETCH m.uploadedBy t " +
           "JOIN FETCH t.user u " +
           "WHERE u.email = :teacherEmail " +
           "ORDER BY m.createdAt DESC")
    List<LearningMaterial> findByTeacherEmailWithDetails(@Param("teacherEmail") String teacherEmail);

    @Query("SELECT m FROM LearningMaterial m " +
           "JOIN FETCH m.schoolClass c " +
           "JOIN FETCH m.subject sub " +
           "JOIN FETCH m.uploadedBy t " +
           "JOIN FETCH t.user u " +
           "ORDER BY m.createdAt DESC")
    List<LearningMaterial> findAllWithDetails();
}
