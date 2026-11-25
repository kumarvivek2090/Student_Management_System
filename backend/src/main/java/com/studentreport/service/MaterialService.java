package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaterialService {

    private final LearningMaterialRepository materialRepository;
    private final SchoolClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public MaterialService(LearningMaterialRepository materialRepository,
                           SchoolClassRepository classRepository,
                           SubjectRepository subjectRepository,
                           TeacherRepository teacherRepository,
                           StudentRepository studentRepository) {
        this.materialRepository = materialRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LearningMaterialDTO> getAll() {
        return materialRepository.findAllWithDetails().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LearningMaterialDTO> getByTeacher(String teacherEmail) {
        return materialRepository.findByTeacherEmailWithDetails(teacherEmail).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LearningMaterialDTO> getForStudent(String studentEmail) {
        Student student = studentRepository.findByUserEmailWithDetails(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (student.getSchoolClass() == null) {
            return List.of();
        }
        return materialRepository.findByClassIdWithDetails(student.getSchoolClass().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.LearningMaterialDTO create(EnterpriseDTO.CreateMaterialRequest request, String teacherEmail) {
        SchoolClass sc = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Subject sub = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher t = teacherRepository.findByUserEmail(teacherEmail)
                .orElseGet(() -> teacherRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found")));

        LearningMaterial mat = LearningMaterial.builder()
                .schoolClass(sc)
                .subject(sub)
                .uploadedBy(t)
                .title(request.getTitle())
                .description(request.getDescription())
                .fileUrl(request.getFileUrl() != null ? request.getFileUrl() : "https://oakridge.edu/materials/syllabus.pdf")
                .fileType(request.getFileType() != null ? request.getFileType() : LearningMaterial.MaterialType.PDF)
                .isPublished(true)
                .build();

        return mapToDTO(materialRepository.save(mat));
    }

    @Transactional
    public void delete(UUID id) {
        materialRepository.deleteById(id);
    }

    private EnterpriseDTO.LearningMaterialDTO mapToDTO(LearningMaterial m) {
        return EnterpriseDTO.LearningMaterialDTO.builder()
                .id(m.getId())
                .classId(m.getSchoolClass().getId())
                .className(m.getSchoolClass().getName())
                .subjectId(m.getSubject().getId())
                .subjectName(m.getSubject().getName())
                .teacherName(m.getUploadedBy().getUser() != null ? m.getUploadedBy().getUser().getFullName() : "Faculty Member")
                .title(m.getTitle())
                .description(m.getDescription())
                .fileUrl(m.getFileUrl())
                .fileType(m.getFileType())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
