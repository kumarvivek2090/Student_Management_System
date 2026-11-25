package com.studentreport.service;

import com.studentreport.entity.SchoolClass;
import com.studentreport.entity.Section;
import com.studentreport.entity.Student;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.ParentStudentRepository;
import com.studentreport.repository.StudentRepository;
import com.studentreport.repository.TeacherAssignmentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SecurityAuthorizationService {

    private final StudentRepository studentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public SecurityAuthorizationService(StudentRepository studentRepository,
                                        ParentStudentRepository parentStudentRepository,
                                        TeacherAssignmentRepository teacherAssignmentRepository) {
        this.studentRepository = studentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    public void validateStudentAcademicAccess(Authentication auth, UUID targetStudentId) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required to access student records");
        }
        String email = auth.getName();
        String role = getRole(auth);

        if ("ADMIN".equals(role)) {
            return; // Institutional Admin has full oversight
        }

        Student targetStudent = studentRepository.findById(targetStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + targetStudentId));

        if ("STUDENT".equals(role)) {
            Student currentStudent = studentRepository.findByUserEmail(email)
                    .orElseThrow(() -> new AccessDeniedException("No student profile linked to user: " + email));
            if (!currentStudent.getId().equals(targetStudentId)) {
                throw new AccessDeniedException("Privacy Violation: You are not authorized to view academic records of other students.");
            }
            return;
        }

        if ("PARENT".equals(role)) {
            boolean isLinked = parentStudentRepository.existsByParentUserEmailAndStudentId(email, targetStudentId);
            if (!isLinked) {
                throw new AccessDeniedException("Privacy Violation: You are only authorized to view academic records for your officially registered children.");
            }
            return;
        }

        if ("TEACHER".equals(role)) {
            SchoolClass sc = targetStudent.getSchoolClass();
            Section sec = targetStudent.getSection();
            if (sc == null || sec == null) {
                throw new AccessDeniedException("Access denied: Student is not assigned to an active class");
            }
            boolean isAssigned = teacherAssignmentRepository.existsByTeacherUserEmailAndSchoolClassIdAndSectionId(
                    email, sc.getId(), sec.getId());
            if (!isAssigned) {
                throw new AccessDeniedException("Access denied: You are not assigned to instruct this student's class and section (" + sc.getName() + " - " + sec.getName() + ").");
            }
            return;
        }

        throw new AccessDeniedException("Unauthorized access to student academic record");
    }

    public void validateFeeAccess(Authentication auth, UUID targetStudentId) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required to access financial records");
        }
        String email = auth.getName();
        String role = getRole(auth);

        if ("ADMIN".equals(role)) {
            return; // Institutional Admin has oversight
        }

        if ("STUDENT".equals(role)) {
            Student currentStudent = studentRepository.findByUserEmail(email)
                    .orElseThrow(() -> new AccessDeniedException("Student profile not found for user: " + email));
            if (!currentStudent.getId().equals(targetStudentId)) {
                throw new AccessDeniedException("Privacy Violation: You cannot view financial and fee records of other students.");
            }
            return;
        }

        if ("PARENT".equals(role)) {
            boolean isLinked = parentStudentRepository.existsByParentUserEmailAndStudentId(email, targetStudentId);
            if (!isLinked) {
                throw new AccessDeniedException("Privacy Violation: You cannot view financial records for students other than your registered children.");
            }
            return;
        }

        // Teachers are strictly restricted from institutional student fee records
        throw new AccessDeniedException("Access Denied: Financial and fee records are confidential and restricted from faculty accounts.");
    }

    public void validateTeacherClassInstruction(Authentication auth, UUID classId, UUID sectionId) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required");
        }
        String role = getRole(auth);
        if ("ADMIN".equals(role)) {
            return; // Admin can manage all classes
        }

        if ("TEACHER".equals(role)) {
            boolean isAssigned = teacherAssignmentRepository.existsByTeacherUserEmailAndSchoolClassIdAndSectionId(
                    auth.getName(), classId, sectionId);
            if (!isAssigned) {
                throw new AccessDeniedException("Access Denied: You are not assigned to instruct Class/Section ID: " + classId + " / " + sectionId + ".");
            }
            return;
        }

        throw new AccessDeniedException("Access Denied: Only assigned faculty instructors or administrators may access class attendance registers.");
    }

    public String getRole(Authentication auth) {
        if (auth == null) return "";
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
