package com.studentreport.repository;

import com.studentreport.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParentRepository extends JpaRepository<Parent, UUID> {
    Optional<Parent> findByUserId(UUID userId);
    Optional<Parent> findByUserEmail(String email);
}
