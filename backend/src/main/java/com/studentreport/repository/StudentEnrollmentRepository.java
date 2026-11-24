package com.studentreport.repository;

import com.studentreport.entity.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, UUID> {
    List<StudentEnrollment> findByStudentId(UUID studentId);
    List<StudentEnrollment> findBySchoolClassIdAndSectionId(UUID classId, UUID sectionId);
    List<StudentEnrollment> findBySchoolClassIdAndSectionIdAndAcademicYearId(UUID classId, UUID sectionId, UUID academicYearId);
}
