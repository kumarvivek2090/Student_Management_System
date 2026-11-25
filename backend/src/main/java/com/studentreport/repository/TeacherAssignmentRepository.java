package com.studentreport.repository;

import com.studentreport.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, UUID> {
    List<TeacherAssignment> findByTeacherId(UUID teacherId);
    List<TeacherAssignment> findBySchoolClassId(UUID classId);

    @Query("SELECT ta FROM TeacherAssignment ta " +
           "JOIN FETCH ta.schoolClass " +
           "JOIN FETCH ta.section " +
           "JOIN FETCH ta.subject " +
           "JOIN FETCH ta.academicYear " +
           "WHERE ta.teacher.user.email = :email")
    List<TeacherAssignment> findByTeacherEmail(@Param("email") String email);

    boolean existsByTeacherUserEmailAndSchoolClassIdAndSectionId(String email, UUID classId, UUID sectionId);
    boolean existsByTeacherUserEmailAndSchoolClassIdAndSectionIdAndSubjectId(String email, UUID classId, UUID sectionId, UUID subjectId);
}
