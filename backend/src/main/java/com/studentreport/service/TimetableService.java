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
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public TimetableService(TimetableRepository timetableRepository,
                            SchoolClassRepository schoolClassRepository,
                            SectionRepository sectionRepository,
                            SubjectRepository subjectRepository,
                            TeacherRepository teacherRepository,
                            StudentRepository studentRepository) {
        this.timetableRepository = timetableRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.TimetableSlotDTO> getByClassAndSection(UUID classId, UUID sectionId) {
        return timetableRepository.findByClassIdAndSectionIdWithDetails(classId, sectionId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.TimetableSlotDTO> getByTeacherEmail(String teacherEmail) {
        return timetableRepository.findByTeacherEmailWithDetails(teacherEmail).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.TimetableSlotDTO> getForStudent(String studentEmail) {
        Student student = studentRepository.findByUserEmailWithDetails(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for " + studentEmail));
        if (student.getSchoolClass() == null || student.getSection() == null) {
            return List.of();
        }
        return getByClassAndSection(student.getSchoolClass().getId(), student.getSection().getId());
    }

    @Transactional
    public EnterpriseDTO.TimetableSlotDTO createSlot(EnterpriseDTO.TimetableCreateRequest request) {
        SchoolClass sc = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Section sec = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        Subject sub = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher t = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        Timetable slot = Timetable.builder()
                .schoolClass(sc)
                .section(sec)
                .subject(sub)
                .teacher(t)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .roomNumber(request.getRoomNumber() != null ? request.getRoomNumber() : "Room 101")
                .build();

        return mapToDTO(timetableRepository.save(slot));
    }

    @Transactional
    public void deleteSlot(UUID id) {
        timetableRepository.deleteById(id);
    }

    private EnterpriseDTO.TimetableSlotDTO mapToDTO(Timetable t) {
        return EnterpriseDTO.TimetableSlotDTO.builder()
                .id(t.getId())
                .classId(t.getSchoolClass().getId())
                .className(t.getSchoolClass().getName())
                .sectionId(t.getSection().getId())
                .sectionName(t.getSection().getName())
                .subjectId(t.getSubject().getId())
                .subjectName(t.getSubject().getName())
                .subjectCode(t.getSubject().getCode())
                .teacherId(t.getTeacher().getId())
                .teacherName(t.getTeacher().getUser() != null ? t.getTeacher().getUser().getFullName() : "Faculty Member")
                .dayOfWeek(t.getDayOfWeek())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .roomNumber(t.getRoomNumber())
                .build();
    }
}
