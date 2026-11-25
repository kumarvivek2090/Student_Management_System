package com.studentreport.repository;

import com.studentreport.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    List<Semester> findByAcademicYearId(UUID academicYearId);
    List<Semester> findAllByAcademicYearIdAndIsCurrentTrue(UUID academicYearId);
    List<Semester> findAllByIsCurrentTrue();

    default Optional<Semester> findByAcademicYearIdAndIsCurrentTrue(UUID academicYearId) {
        if (academicYearId != null) {
            List<Semester> list = findAllByAcademicYearIdAndIsCurrentTrue(academicYearId);
            if (!list.isEmpty()) {
                return Optional.of(list.get(0));
            }
            return findByAcademicYearId(academicYearId).stream().findFirst();
        }
        return findByIsCurrentTrue();
    }

    default Optional<Semester> findByIsCurrentTrue() {
        List<Semester> list = findAllByIsCurrentTrue();
        if (!list.isEmpty()) {
            return Optional.of(list.get(0));
        }
        return findAll().stream().findFirst();
    }
}
