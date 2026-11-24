package com.studentreport.service;

import com.studentreport.dto.AcademicDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AcademicService {

    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final ExaminationRepository examinationRepository;
    private final AssessmentRepository assessmentRepository;
    private final GradingScaleRepository gradingScaleRepository;
    private final AppSettingRepository appSettingRepository;

    public AcademicService(SchoolClassRepository classRepository,
                           SectionRepository sectionRepository,
                           SubjectRepository subjectRepository,
                           AcademicYearRepository academicYearRepository,
                           SemesterRepository semesterRepository,
                           ExaminationRepository examinationRepository,
                           AssessmentRepository assessmentRepository,
                           GradingScaleRepository gradingScaleRepository,
                           AppSettingRepository appSettingRepository) {
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.examinationRepository = examinationRepository;
        this.assessmentRepository = assessmentRepository;
        this.gradingScaleRepository = gradingScaleRepository;
        this.appSettingRepository = appSettingRepository;
    }

    // Classes
    @Transactional(readOnly = true)
    public List<AcademicDTO.ClassResponse> getAllClasses() {
        return classRepository.findAll().stream().map(this::mapClassToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.ClassResponse createClass(AcademicDTO.ClassRequest req) {
        if (classRepository.findByName(req.getName()).isPresent()) {
            throw new BadRequestException("Class already exists: " + req.getName());
        }
        SchoolClass c = SchoolClass.builder()
                .name(req.getName().trim())
                .gradeLevel(req.getGradeLevel())
                .description(req.getDescription())
                .build();
        return mapClassToDTO(classRepository.save(c));
    }

    @Transactional
    public AcademicDTO.ClassResponse updateClass(UUID id, AcademicDTO.ClassRequest req) {
        SchoolClass c = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        c.setName(req.getName().trim());
        c.setGradeLevel(req.getGradeLevel());
        c.setDescription(req.getDescription());
        return mapClassToDTO(classRepository.save(c));
    }

    @Transactional
    public void deleteClass(UUID id) {
        classRepository.deleteById(id);
    }

    // Sections
    @Transactional(readOnly = true)
    public List<AcademicDTO.SectionResponse> getSectionsByClass(UUID classId) {
        return sectionRepository.findBySchoolClassId(classId).stream().map(this::mapSectionToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.SectionResponse createSection(AcademicDTO.SectionRequest req) {
        SchoolClass c = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Section s = Section.builder()
                .schoolClass(c)
                .name(req.getName().trim())
                .capacity(req.getCapacity() != null ? req.getCapacity() : 40)
                .roomNumber(req.getRoomNumber())
                .build();
        return mapSectionToDTO(sectionRepository.save(s));
    }

    @Transactional
    public void deleteSection(UUID id) {
        sectionRepository.deleteById(id);
    }

    // Subjects
    @Transactional(readOnly = true)
    public List<AcademicDTO.SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream().map(this::mapSubjectToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.SubjectResponse createSubject(AcademicDTO.SubjectRequest req) {
        if (subjectRepository.existsByCode(req.getCode())) {
            throw new BadRequestException("Subject code already exists: " + req.getCode());
        }
        Subject s = Subject.builder()
                .name(req.getName().trim())
                .code(req.getCode().trim().toUpperCase())
                .description(req.getDescription())
                .credits(req.getCredits() != null ? req.getCredits() : 3)
                .build();
        return mapSubjectToDTO(subjectRepository.save(s));
    }

    @Transactional
    public AcademicDTO.SubjectResponse updateSubject(UUID id, AcademicDTO.SubjectRequest req) {
        Subject s = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        s.setName(req.getName().trim());
        s.setCode(req.getCode().trim().toUpperCase());
        s.setDescription(req.getDescription());
        s.setCredits(req.getCredits() != null ? req.getCredits() : 3);
        return mapSubjectToDTO(subjectRepository.save(s));
    }

    @Transactional
    public void deleteSubject(UUID id) {
        subjectRepository.deleteById(id);
    }

    // Academic Years
    @Transactional(readOnly = true)
    public List<AcademicDTO.AcademicYearResponse> getAllAcademicYears() {
        return academicYearRepository.findAll().stream().map(this::mapYearToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.AcademicYearResponse createAcademicYear(AcademicDTO.AcademicYearRequest req) {
        AcademicYear y = AcademicYear.builder()
                .name(req.getName().trim())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrent(req.getIsCurrent() != null ? req.getIsCurrent() : false)
                .build();
        return mapYearToDTO(academicYearRepository.save(y));
    }

    // Semesters
    @Transactional(readOnly = true)
    public List<AcademicDTO.SemesterResponse> getSemestersByYear(UUID yearId) {
        return semesterRepository.findByAcademicYearId(yearId).stream().map(this::mapSemesterToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.SemesterResponse createSemester(AcademicDTO.SemesterRequest req) {
        AcademicYear y = academicYearRepository.findById(req.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));
        Semester sem = Semester.builder()
                .academicYear(y)
                .name(req.getName().trim())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrent(req.getIsCurrent() != null ? req.getIsCurrent() : false)
                .build();
        return mapSemesterToDTO(semesterRepository.save(sem));
    }

    // Examinations
    @Transactional(readOnly = true)
    public List<AcademicDTO.ExaminationResponse> getAllExaminations() {
        return examinationRepository.findAll().stream().map(this::mapExamToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.ExaminationResponse createExamination(AcademicDTO.ExaminationRequest req) {
        AcademicYear y = academicYearRepository.findById(req.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));
        Semester sem = semesterRepository.findById(req.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found"));

        Examination e = Examination.builder()
                .name(req.getName().trim())
                .examType(req.getExamType())
                .academicYear(y)
                .semester(sem)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .status(req.getStatus() != null ? req.getStatus() : Examination.ExamStatus.SCHEDULED)
                .description(req.getDescription())
                .build();
        return mapExamToDTO(examinationRepository.save(e));
    }

    // Assessments
    @Transactional(readOnly = true)
    public List<AcademicDTO.AssessmentResponse> getAssessmentsByExam(UUID examId) {
        return assessmentRepository.findByExaminationId(examId).stream().map(this::mapAssessmentToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AcademicDTO.AssessmentResponse> getAssessmentsByClassAndSection(UUID classId, UUID sectionId) {
        return assessmentRepository.findByClassAndSection(classId, sectionId).stream().map(this::mapAssessmentToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AcademicDTO.AssessmentResponse createAssessment(AcademicDTO.AssessmentRequest req) {
        Examination e = examinationRepository.findById(req.getExaminationId())
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found"));
        SchoolClass c = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Section s = sectionRepository.findById(req.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        Subject sub = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        Assessment a = Assessment.builder()
                .examination(e)
                .schoolClass(c)
                .section(s)
                .subject(sub)
                .name(req.getName().trim())
                .maxMarks(req.getMaxMarks())
                .passingMarks(req.getPassingMarks())
                .assessmentDate(req.getAssessmentDate() != null ? req.getAssessmentDate() : java.time.LocalDate.now())
                .weightage(req.getWeightage() != null ? req.getWeightage() : java.math.BigDecimal.valueOf(100.0))
                .build();
        return mapAssessmentToDTO(assessmentRepository.save(a));
    }

    // Grading Scales
    @Transactional(readOnly = true)
    public List<GradingScale> getAllGradingScales() {
        return gradingScaleRepository.findByIsActiveTrueOrderByMinPercentageDesc();
    }

    @Transactional
    public GradingScale saveGradingScale(GradingScale scale) {
        return gradingScaleRepository.save(scale);
    }

    @Transactional
    public void deleteGradingScale(UUID id) {
        gradingScaleRepository.deleteById(id);
    }

    // App Settings
    @Transactional(readOnly = true)
    public List<AppSetting> getAllSettings() {
        return appSettingRepository.findAll();
    }

    @Transactional
    public AppSetting updateSetting(String key, String value) {
        AppSetting setting = appSettingRepository.findBySettingKey(key)
                .orElseGet(() -> AppSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        return appSettingRepository.save(setting);
    }

    // Mappers
    private AcademicDTO.ClassResponse mapClassToDTO(SchoolClass c) {
        List<AcademicDTO.SectionResponse> secs = sectionRepository.findBySchoolClassId(c.getId())
                .stream().map(this::mapSectionToDTO).collect(Collectors.toList());
        return AcademicDTO.ClassResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .gradeLevel(c.getGradeLevel())
                .description(c.getDescription())
                .sections(secs)
                .build();
    }

    private AcademicDTO.SectionResponse mapSectionToDTO(Section s) {
        return AcademicDTO.SectionResponse.builder()
                .id(s.getId())
                .classId(s.getSchoolClass().getId())
                .className(s.getSchoolClass().getName())
                .name(s.getName())
                .capacity(s.getCapacity())
                .roomNumber(s.getRoomNumber())
                .build();
    }

    private AcademicDTO.SubjectResponse mapSubjectToDTO(Subject s) {
        return AcademicDTO.SubjectResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .code(s.getCode())
                .description(s.getDescription())
                .credits(s.getCredits())
                .build();
    }

    private AcademicDTO.AcademicYearResponse mapYearToDTO(AcademicYear y) {
        List<AcademicDTO.SemesterResponse> sems = semesterRepository.findByAcademicYearId(y.getId())
                .stream().map(this::mapSemesterToDTO).collect(Collectors.toList());
        return AcademicDTO.AcademicYearResponse.builder()
                .id(y.getId())
                .name(y.getName())
                .startDate(y.getStartDate())
                .endDate(y.getEndDate())
                .isCurrent(y.getIsCurrent())
                .semesters(sems)
                .build();
    }

    private AcademicDTO.SemesterResponse mapSemesterToDTO(Semester s) {
        return AcademicDTO.SemesterResponse.builder()
                .id(s.getId())
                .academicYearId(s.getAcademicYear().getId())
                .name(s.getName())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .isCurrent(s.getIsCurrent())
                .build();
    }

    public AcademicDTO.ExaminationResponse mapExamToDTO(Examination e) {
        List<AcademicDTO.AssessmentResponse> assts = assessmentRepository.findByExaminationId(e.getId())
                .stream().map(this::mapAssessmentToDTO).collect(Collectors.toList());
        return AcademicDTO.ExaminationResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .examType(e.getExamType())
                .academicYearId(e.getAcademicYear().getId())
                .academicYearName(e.getAcademicYear().getName())
                .semesterId(e.getSemester().getId())
                .semesterName(e.getSemester().getName())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .status(e.getStatus())
                .description(e.getDescription())
                .assessments(assts)
                .build();
    }

    public AcademicDTO.AssessmentResponse mapAssessmentToDTO(Assessment a) {
        return AcademicDTO.AssessmentResponse.builder()
                .id(a.getId())
                .examinationId(a.getExamination().getId())
                .examinationName(a.getExamination().getName())
                .classId(a.getSchoolClass().getId())
                .className(a.getSchoolClass().getName())
                .sectionId(a.getSection().getId())
                .sectionName(a.getSection().getName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .subjectCode(a.getSubject().getCode())
                .name(a.getName())
                .maxMarks(a.getMaxMarks())
                .passingMarks(a.getPassingMarks())
                .assessmentDate(a.getAssessmentDate())
                .weightage(a.getWeightage())
                .build();
    }
}
