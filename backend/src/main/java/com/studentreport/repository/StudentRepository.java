package com.studentreport.repository;

import com.studentreport.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByUserId(UUID userId);
    Optional<Student> findByUserEmail(String email);

    @Query("SELECT s FROM Student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH s.schoolClass c " +
           "LEFT JOIN FETCH s.section sec " +
           "WHERE u.email = :email")
    Optional<Student> findByUserEmailWithDetails(@Param("email") String email);

    @Query("SELECT s FROM Student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH s.schoolClass c " +
           "LEFT JOIN FETCH s.section sec " +
           "WHERE u.id = :userId")
    Optional<Student> findByUserIdWithDetails(@Param("userId") UUID userId);

    List<Student> findBySchoolClassId(UUID classId);
    List<Student> findBySchoolClassIdAndSectionId(UUID classId, UUID sectionId);

    @Query("SELECT s FROM Student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH s.schoolClass c " +
           "LEFT JOIN FETCH s.section sec " +
           "WHERE s.id = :id")
    Optional<Student> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT s FROM Student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH s.schoolClass c " +
           "LEFT JOIN FETCH s.section sec " +
           "WHERE (cast(:classId as uuid) IS NULL OR s.schoolClass.id = :classId) " +
           "AND (cast(:sectionId as uuid) IS NULL OR s.section.id = :sectionId) " +
           "AND (cast(:academicYearId as uuid) IS NULL OR s.academicYear.id = :academicYearId) " +
           "ORDER BY s.rollNumber ASC")
    List<Student> findByFilters(
            @Param("classId") UUID classId,
            @Param("sectionId") UUID sectionId,
            @Param("academicYearId") UUID academicYearId
    );

    @Query(value = "SELECT s FROM Student s " +
           "JOIN FETCH s.user u " +
           "LEFT JOIN FETCH s.schoolClass c " +
           "LEFT JOIN FETCH s.section sec " +
           "WHERE (cast(:classId as uuid) IS NULL OR s.schoolClass.id = :classId) " +
           "AND (cast(:sectionId as uuid) IS NULL OR s.section.id = :sectionId) " +
           "AND (cast(:academicYearId as uuid) IS NULL OR s.academicYear.id = :academicYearId) " +
           "AND (cast(:query as string) IS NULL OR cast(:query as string) = '' " +
           "     OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', cast(:query as string), '%')) " +
           "     OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', cast(:query as string), '%')) " +
           "     OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', cast(:query as string), '%')) " +
           "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', cast(:query as string), '%')))",
           countQuery = "SELECT COUNT(s) FROM Student s " +
           "JOIN s.user u " +
           "WHERE (cast(:classId as uuid) IS NULL OR s.schoolClass.id = :classId) " +
           "AND (cast(:sectionId as uuid) IS NULL OR s.section.id = :sectionId) " +
           "AND (cast(:academicYearId as uuid) IS NULL OR s.academicYear.id = :academicYearId) " +
           "AND (cast(:query as string) IS NULL OR cast(:query as string) = '' " +
           "     OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', cast(:query as string), '%')) " +
           "     OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', cast(:query as string), '%')) " +
           "     OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', cast(:query as string), '%')) " +
           "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', cast(:query as string), '%')))")
    Page<Student> findByFiltersPaged(
            @Param("classId") UUID classId,
            @Param("sectionId") UUID sectionId,
            @Param("academicYearId") UUID academicYearId,
            @Param("query") String query,
            Pageable pageable
    );
}
