package com.studentreport.repository;

import com.studentreport.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionRepository extends JpaRepository<Section, UUID> {
    List<Section> findBySchoolClassId(UUID classId);
    Optional<Section> findBySchoolClassIdAndName(UUID classId, String name);
}
