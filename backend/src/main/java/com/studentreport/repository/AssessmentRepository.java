package com.studentreport.repository;

import com.studentreport.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
    List<Assessment> findByExaminationId(UUID examinationId);
    List<Assessment> findBySchoolClassIdAndSectionIdAndSubjectId(UUID classId, UUID sectionId, UUID subjectId);

    @Query("SELECT a FROM Assessment a " +
           "JOIN FETCH a.examination e " +
           "JOIN FETCH a.subject s " +
           "WHERE a.schoolClass.id = :classId AND a.section.id = :sectionId " +
           "ORDER BY a.assessmentDate DESC")
    List<Assessment> findByClassAndSection(@Param("classId") UUID classId, @Param("sectionId") UUID sectionId);

    Optional<Assessment> findByExaminationIdAndSchoolClassIdAndSectionIdAndSubjectIdAndName(
            UUID examinationId, UUID classId, UUID sectionId, UUID subjectId, String name);
}
