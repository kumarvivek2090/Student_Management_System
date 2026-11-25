package com.studentreport.repository;

import com.studentreport.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, UUID> {

    @Query("SELECT t FROM Timetable t " +
           "JOIN FETCH t.schoolClass c " +
           "JOIN FETCH t.section s " +
           "JOIN FETCH t.subject sub " +
           "JOIN FETCH t.teacher te " +
           "JOIN FETCH te.user u " +
           "WHERE t.schoolClass.id = :classId AND t.section.id = :sectionId " +
           "ORDER BY t.dayOfWeek, t.startTime")
    List<Timetable> findByClassIdAndSectionIdWithDetails(@Param("classId") UUID classId, @Param("sectionId") UUID sectionId);

    @Query("SELECT t FROM Timetable t " +
           "JOIN FETCH t.schoolClass c " +
           "JOIN FETCH t.section s " +
           "JOIN FETCH t.subject sub " +
           "JOIN FETCH t.teacher te " +
           "JOIN FETCH te.user u " +
           "WHERE te.id = :teacherId " +
           "ORDER BY t.dayOfWeek, t.startTime")
    List<Timetable> findByTeacherIdWithDetails(@Param("teacherId") UUID teacherId);

    @Query("SELECT t FROM Timetable t " +
           "JOIN FETCH t.schoolClass c " +
           "JOIN FETCH t.section s " +
           "JOIN FETCH t.subject sub " +
           "JOIN FETCH t.teacher te " +
           "JOIN FETCH te.user u " +
           "WHERE u.email = :teacherEmail " +
           "ORDER BY t.dayOfWeek, t.startTime")
    List<Timetable> findByTeacherEmailWithDetails(@Param("teacherEmail") String teacherEmail);
}
