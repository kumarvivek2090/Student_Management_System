package com.studentreport.repository;

import com.studentreport.entity.AcademicEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicEventRepository extends JpaRepository<AcademicEvent, UUID> {
    List<AcademicEvent> findByIsPublishedTrueOrderByStartDateAsc();
    List<AcademicEvent> findByStartDateBetweenOrderByStartDateAsc(LocalDate start, LocalDate end);
    List<AcademicEvent> findByEventTypeOrderByStartDateAsc(AcademicEvent.EventType eventType);
}
