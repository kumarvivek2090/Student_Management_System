package com.studentreport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessments", uniqueConstraints = {
    @UniqueConstraint(name = "uq_assessment", columnNames = {"examination_id", "class_id", "section_id", "subject_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examination_id", nullable = false)
    private Examination examination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "max_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal maxMarks;

    @Column(name = "passing_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal passingMarks;

    @Column(name = "assessment_date")
    @Builder.Default
    private LocalDate assessmentDate = LocalDate.now();

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weightage = BigDecimal.valueOf(100.0);

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
