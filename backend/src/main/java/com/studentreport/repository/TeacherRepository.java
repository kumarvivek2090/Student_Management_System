package com.studentreport.repository;

import com.studentreport.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByTeacherId(String teacherId);
    Optional<Teacher> findByUserId(UUID userId);
    Optional<Teacher> findByUserEmail(String email);

    @Query("SELECT t FROM Teacher t JOIN FETCH t.user u ORDER BY u.fullName ASC")
    List<Teacher> findAllWithUser();
}
