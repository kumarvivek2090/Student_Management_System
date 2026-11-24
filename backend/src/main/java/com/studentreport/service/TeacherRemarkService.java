package com.studentreport.service;

import com.studentreport.dto.RemarkDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeacherRemarkService {

    private final TeacherRemarkRepository remarkRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;

    public TeacherRemarkService(TeacherRemarkRepository remarkRepository,
                                StudentRepository studentRepository,
                                TeacherRepository teacherRepository,
                                SubjectRepository subjectRepository,
                                SemesterRepository semesterRepository) {
        this.remarkRepository = remarkRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.semesterRepository = semesterRepository;
    }

    @Transactional
    public RemarkDTO.RemarkResponseDTO createRemark(RemarkDTO.RemarkRequest request, String teacherEmail) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Teacher teacher = teacherRepository.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user: " + teacherEmail));
        Subject subject = request.getSubjectId() != null 
                ? subjectRepository.findById(request.getSubjectId()).orElse(null) : null;
        Semester semester = request.getSemesterId() != null 
                ? semesterRepository.findById(request.getSemesterId()).orElse(null) : null;

        TeacherRemark remark = TeacherRemark.builder()
                .student(student)
                .teacher(teacher)
                .subject(subject)
                .semester(semester)
                .category(request.getCategory())
                .description(request.getDescription())
                .isPublished(Boolean.TRUE.equals(request.getIsPublished()))
                .build();

        return mapToDTO(remarkRepository.save(remark));
    }

    @Transactional(readOnly = true)
    public List<RemarkDTO.RemarkResponseDTO> getRemarksByStudent(UUID studentId, boolean onlyPublished) {
        if (onlyPublished) {
            return remarkRepository.findPublishedByStudentWithDetails(studentId).stream()
                    .map(this::mapToDTO).collect(Collectors.toList());
        }
        return remarkRepository.findAllByStudentWithDetails(studentId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public RemarkDTO.RemarkResponseDTO updateRemark(UUID id, RemarkDTO.RemarkRequest request) {
        TeacherRemark remark = remarkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remark not found"));
        remark.setCategory(request.getCategory());
        remark.setDescription(request.getDescription());
        if (request.getIsPublished() != null) {
            remark.setIsPublished(request.getIsPublished());
        }
        return mapToDTO(remarkRepository.save(remark));
    }

    @Transactional
    public void deleteRemark(UUID id) {
        remarkRepository.deleteById(id);
    }

    public RemarkDTO.RemarkResponseDTO mapToDTO(TeacherRemark r) {
        return RemarkDTO.RemarkResponseDTO.builder()
                .id(r.getId())
                .studentId(r.getStudent().getId())
                .studentFullName(r.getStudent().getUser().getFullName())
                .studentRollNumber(r.getStudent().getRollNumber())
                .teacherId(r.getTeacher().getId())
                .teacherFullName(r.getTeacher().getUser().getFullName())
                .subjectId(r.getSubject() != null ? r.getSubject().getId() : null)
                .subjectName(r.getSubject() != null ? r.getSubject().getName() : null)
                .semesterId(r.getSemester() != null ? r.getSemester().getId() : null)
                .semesterName(r.getSemester() != null ? r.getSemester().getName() : null)
                .category(r.getCategory())
                .description(r.getDescription())
                .isPublished(r.getIsPublished())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
