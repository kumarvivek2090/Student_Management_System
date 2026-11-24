package com.studentreport.service;

import com.studentreport.dto.AttendanceDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    public AttendanceService(AttendanceRecordRepository attendanceRepository,
                             StudentRepository studentRepository,
                             SchoolClassRepository classRepository,
                             SectionRepository sectionRepository,
                             SubjectRepository subjectRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<AttendanceDTO.AttendanceResponseDTO> saveBulkAttendance(AttendanceDTO.BulkAttendanceRequest request, String userEmail) {
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + request.getClassId()));
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + request.getSectionId()));
        Subject subject = request.getSubjectId() != null 
                ? subjectRepository.findById(request.getSubjectId()).orElse(null) : null;
        User recordedBy = userRepository.findByEmail(userEmail).orElse(null);

        List<AttendanceDTO.AttendanceResponseDTO> results = new ArrayList<>();

        for (AttendanceDTO.AttendanceEntry entry : request.getAttendanceList()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + entry.getStudentId()));

            Optional<AttendanceRecord> existingOpt = attendanceRepository.findExistingRecord(
                    student.getId(), schoolClass.getId(), section.getId(), request.getAttendanceDate(), request.getSubjectId());

            AttendanceRecord record = existingOpt.orElseGet(() -> AttendanceRecord.builder()
                    .student(student)
                    .schoolClass(schoolClass)
                    .section(section)
                    .subject(subject)
                    .attendanceDate(request.getAttendanceDate())
                    .build());

            record.setStatus(entry.getStatus());
            record.setRemarks(entry.getRemarks());
            record.setRecordedBy(recordedBy);

            record = attendanceRepository.save(record);
            results.add(mapToDTO(record));
        }

        return results;
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
            // Count present + late as attended
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
