package com.studentreport.service;

import com.studentreport.dto.AttendanceDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final ActivityLogService activityLogService;

    public AttendanceService(AttendanceRecordRepository attendanceRepository,
                             StudentRepository studentRepository,
                             SchoolClassRepository classRepository,
                             SectionRepository sectionRepository,
                             SubjectRepository subjectRepository,
                             UserRepository userRepository,
                             TeacherAssignmentRepository teacherAssignmentRepository,
                             ActivityLogService activityLogService) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public AttendanceDTO.AttendanceLockStatusDTO getLockStatus(UUID classId, UUID sectionId, LocalDate date, String userEmail, String userRole) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + sectionId));

        List<AttendanceRecord> records = attendanceRepository.findByClassSectionAndDate(classId, sectionId, date);

        if (records.isEmpty()) {
            boolean canEdit = true;
            String message = "Attendance register open for submission.";

            if ("TEACHER".equals(userRole)) {
                boolean isAssigned = teacherAssignmentRepository.existsByTeacherUserEmailAndSchoolClassIdAndSectionId(
                        userEmail, classId, sectionId);
                if (!isAssigned) {
                    canEdit = false;
                    message = "You are not assigned to instruct Class " + schoolClass.getName() + " - Section " + section.getName() + ".";
                }
            }

            return AttendanceDTO.AttendanceLockStatusDTO.builder()
                    .isSubmitted(false)
                    .isLocked(false)
                    .canEdit(canEdit)
                    .totalRecords(0)
                    .presentCount(0)
                    .absentCount(0)
                    .lateCount(0)
                    .excusedCount(0)
                    .message(message)
                    .build();
        }

        // Attendance has been recorded
        AttendanceRecord first = records.get(0);
        int total = records.size();
        int present = (int) records.stream().filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.PRESENT).count();
        int absent = (int) records.stream().filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.ABSENT).count();
        int late = (int) records.stream().filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.LATE).count();
        int excused = (int) records.stream().filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.EXCUSED).count();

        String recorderName = first.getRecordedBy() != null ? first.getRecordedBy().getFullName() : "Faculty Member";
        String recorderEmail = first.getRecordedBy() != null ? first.getRecordedBy().getEmail() : null;
        ZonedDateTime submittedAt = first.getCreatedAt() != null ? first.getCreatedAt() : ZonedDateTime.now();

        boolean canEdit = "ADMIN".equals(userRole);
        boolean isLocked = !"ADMIN".equals(userRole);
        String message = "ADMIN".equals(userRole)
                ? "Attendance submitted on " + date + " by " + recorderName + ". Administrative modifications permitted."
                : "Attendance Submitted Successfully on " + date + " by " + recorderName + ". Register permanently locked.";

        return AttendanceDTO.AttendanceLockStatusDTO.builder()
                .isSubmitted(true)
                .isLocked(isLocked)
                .canEdit(canEdit)
                .submittedByName(recorderName)
                .submittedByEmail(recorderEmail)
                .submittedAt(submittedAt)
                .totalRecords(total)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .excusedCount(excused)
                .message(message)
                .build();
    }

    @Transactional
    public List<AttendanceDTO.AttendanceResponseDTO> saveBulkAttendance(AttendanceDTO.BulkAttendanceRequest request, String userEmail, String userRole) {
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + request.getClassId()));
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + request.getSectionId()));
        Subject subject = request.getSubjectId() != null 
                ? subjectRepository.findById(request.getSubjectId()).orElse(null) : null;
        User recordedBy = userRepository.findByEmail(userEmail).orElse(null);

        // 1. If TEACHER, verify assignment
        if ("TEACHER".equals(userRole)) {
            boolean isAssigned = teacherAssignmentRepository.existsByTeacherUserEmailAndSchoolClassIdAndSectionId(
                    userEmail, request.getClassId(), request.getSectionId());
            if (!isAssigned) {
                throw new AccessDeniedException("Unauthorized: You are not assigned to instruct Class " + 
                        schoolClass.getName() + " - Section " + section.getName());
            }
        }

        // 2. Strict One-Time Submission Enforcement: Check if attendance already exists
        List<AttendanceRecord> existing = attendanceRepository.findByClassSectionAndDate(
                request.getClassId(), request.getSectionId(), request.getAttendanceDate());
        if (!existing.isEmpty()) {
            AttendanceRecord first = existing.get(0);
            String subBy = first.getRecordedBy() != null ? first.getRecordedBy().getFullName() : "Faculty";
            throw new IllegalStateException("Attendance for Class " + schoolClass.getName() + " - Section " + 
                    section.getName() + " on " + request.getAttendanceDate() + 
                    " has already been permanently submitted by " + subBy + 
                    ". Duplicate submissions are strictly prevented. Modifications require administrative approval.");
        }

        // 3. Persist new attendance records within transactional boundary
        List<AttendanceDTO.AttendanceResponseDTO> results = new ArrayList<>();

        for (AttendanceDTO.AttendanceEntry entry : request.getAttendanceList()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + entry.getStudentId()));

            AttendanceRecord record = AttendanceRecord.builder()
                    .student(student)
                    .schoolClass(schoolClass)
                    .section(section)
                    .subject(subject)
                    .attendanceDate(request.getAttendanceDate())
                    .status(entry.getStatus())
                    .remarks(entry.getRemarks())
                    .recordedBy(recordedBy)
                    .build();

            record = attendanceRepository.save(record);
            results.add(mapToDTO(record));
        }

        // 4. Record Audit Log
        activityLogService.log(
                userEmail,
                "ATTENDANCE_SUBMITTED",
                "Daily attendance submitted for Class " + schoolClass.getName() + " - Section " + 
                section.getName() + " on " + request.getAttendanceDate() + " (" + results.size() + " students recorded)",
                null,
                ActivityLog.Severity.INFO
        );

        return results;
    }

    @Transactional
    public List<AttendanceDTO.AttendanceResponseDTO> correctAttendance(AttendanceDTO.AttendanceCorrectionRequest request, String adminEmail) {
        if (request.getReason() == null || request.getReason().trim().length() < 5) {
            throw new IllegalArgumentException("Mandatory justification reason (at least 5 characters) required for administrative attendance correction.");
        }

        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + request.getClassId()));
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + request.getSectionId()));

        List<AttendanceRecord> records = attendanceRepository.findByClassSectionAndDate(
                request.getClassId(), request.getSectionId(), request.getAttendanceDate());

        if (records.isEmpty()) {
            throw new ResourceNotFoundException("No attendance records found to correct for Class " + 
                    schoolClass.getName() + " - Section " + section.getName() + " on " + request.getAttendanceDate());
        }

        Map<UUID, AttendanceRecord> recordMap = records.stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r, (r1, r2) -> r1));

        List<AttendanceDTO.AttendanceResponseDTO> updated = new ArrayList<>();
        User adminUser = userRepository.findByEmail(adminEmail).orElse(null);

        for (AttendanceDTO.AttendanceEntry corr : request.getCorrections()) {
            AttendanceRecord record = recordMap.get(corr.getStudentId());
            if (record != null) {
                record.setStatus(corr.getStatus());
                String auditNote = "[Admin Correction: " + request.getReason().trim() + " - Authorized by " + adminEmail + "]";
                record.setRemarks(corr.getRemarks() != null && !corr.getRemarks().isBlank()
                        ? corr.getRemarks() + " " + auditNote
                        : auditNote);
                record.setRecordedBy(adminUser != null ? adminUser : record.getRecordedBy());
                record = attendanceRepository.save(record);
                updated.add(mapToDTO(record));
            }
        }

        // Audit Trail
        activityLogService.log(
                adminEmail,
                "ATTENDANCE_CORRECTED",
                "Administrator performed authorized attendance correction for Class " + schoolClass.getName() + 
                " - Section " + section.getName() + " on " + request.getAttendanceDate() + 
                ". Justification: " + request.getReason().trim() + " (" + updated.size() + " records updated)",
                null,
                ActivityLog.Severity.WARN
        );

        return updated;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO.ClassAttendanceOverviewDTO> getAdminOverview(LocalDate date) {
        List<AttendanceDTO.ClassAttendanceOverviewDTO> overview = new ArrayList<>();
        List<SchoolClass> classes = classRepository.findAll();

        for (SchoolClass c : classes) {
            List<Section> sections = sectionRepository.findBySchoolClassId(c.getId());
            for (Section s : sections) {
                List<AttendanceRecord> records = attendanceRepository.findByClassSectionAndDate(c.getId(), s.getId(), date);
                boolean isSub = !records.isEmpty();
                int total = records.size();
                int pres = (int) records.stream().filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.PRESENT).count();
                int abs = (int) records.stream().filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.ABSENT).count();
                String subBy = isSub && records.get(0).getRecordedBy() != null ? records.get(0).getRecordedBy().getFullName() : null;
                ZonedDateTime subAt = isSub ? records.get(0).getCreatedAt() : null;

                overview.add(AttendanceDTO.ClassAttendanceOverviewDTO.builder()
                        .classId(c.getId())
                        .className(c.getName())
                        .sectionId(s.getId())
                        .sectionName(s.getName())
                        .date(date)
                        .isSubmitted(isSub)
                        .submittedByName(subBy)
                        .submittedAt(subAt)
                        .studentCount(total)
                        .presentCount(pres)
                        .absentCount(abs)
                        .build());
            }
        }

        return overview;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO.AttendanceResponseDTO> getAttendanceByStudent(UUID studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO.AttendanceResponseDTO> getAttendanceByClassSectionAndDate(UUID classId, UUID sectionId, LocalDate date) {
        return attendanceRepository.findByClassSectionAndDate(classId, sectionId, date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceDTO.AttendanceSummaryDTO getStudentAttendanceSummary(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        long total = attendanceRepository.countByStudentId(studentId);
        long present = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceRecord.AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceRecord.AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceRecord.AttendanceStatus.LATE);
        long excused = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceRecord.AttendanceStatus.EXCUSED);

        BigDecimal percentage = BigDecimal.ZERO;
        if (total > 0) {
            long attended = present + late;
            percentage = BigDecimal.valueOf(attended)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return AttendanceDTO.AttendanceSummaryDTO.builder()
                .studentId(student.getId())
                .studentFullName(student.getUser().getFullName())
                .totalSessions(total)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .excusedCount(excused)
                .attendancePercentage(percentage)
                .build();
    }

    private AttendanceDTO.AttendanceResponseDTO mapToDTO(AttendanceRecord record) {
        return AttendanceDTO.AttendanceResponseDTO.builder()
                .id(record.getId())
                .studentId(record.getStudent().getId())
                .studentFullName(record.getStudent().getUser().getFullName())
                .studentRollNumber(record.getStudent().getRollNumber())
                .attendanceDate(record.getAttendanceDate())
                .status(record.getStatus())
                .remarks(record.getRemarks())
                .recordedByName(record.getRecordedBy() != null ? record.getRecordedBy().getFullName() : null)
                .build();
    }
}
