package com.studentreport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "grading_scales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradingScale {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 10)
    private String grade;

    @Column(name = "min_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal minPercentage;

    @Column(name = "max_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal maxPercentage;

    @Column(name = "grade_point", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal gradePoint = BigDecimal.ZERO;

    @Column(length = 100)
    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
