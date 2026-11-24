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
@Table(name = "report_cards", uniqueConstraints = {
    @UniqueConstraint(name = "uq_report_student_sem", columnNames = {"student_id", "academic_year_id", "semester_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "total_marks", precision = 7, scale = 2)
    @Builder.Default
    private BigDecimal totalMarks = BigDecimal.ZERO;

    @Column(name = "obtained_marks", precision = 7, scale = 2)
    @Builder.Default
    private BigDecimal obtainedMarks = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal percentage = BigDecimal.ZERO;

    @Column(name = "overall_grade", length = 10)
    private String overallGrade;

    @Column(name = "attendance_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal attendancePercentage = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.DRAFT;

    @Column(name = "issued_date")
    @Builder.Default
    private LocalDate issuedDate = LocalDate.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public enum ReportStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }
}
