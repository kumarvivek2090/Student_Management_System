package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public LeaveService(LeaveRequestRepository leaveRepository,
                        UserRepository userRepository,
                        StudentRepository studentRepository,
                        TeacherRepository teacherRepository,
                        TeacherAssignmentRepository teacherAssignmentRepository,
                        NotificationService notificationService,
                        ActivityLogService activityLogService) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LeaveRequestDTO> getAll(String roleFilter, LeaveRequest.LeaveStatus statusFilter, String search) {
        List<LeaveRequest> list = leaveRepository.findAllWithDetails();

        return list.stream()
                .filter(l -> {
                    if (roleFilter != null && !roleFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(roleFilter)) {
                        if (!l.getRole().equalsIgnoreCase(roleFilter)) return false;
                    }
                    if (statusFilter != null) {
                        if (l.getStatus() != statusFilter) return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        boolean matchName = l.getUser().getFullName() != null && l.getUser().getFullName().toLowerCase().contains(s);
                        boolean matchEmail = l.getUser().getEmail() != null && l.getUser().getEmail().toLowerCase().contains(s);
                        boolean matchReason = l.getReason() != null && l.getReason().toLowerCase().contains(s);
                        if (!matchName && !matchEmail && !matchReason) return false;
                    }
                    return true;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LeaveRequestDTO> getMyLeaves(String email) {
        return leaveRepository.findByUserEmailWithDetails(email).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LeaveRequestDTO> getStudentLeavesForTeacher(String teacherEmail) {
        return leaveRepository.findStudentLeavesForTeacher(teacherEmail).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.LeaveRequestDTO apply(EnterpriseDTO.ApplyLeaveRequest request, String email, String role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Both start date and end date are required.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot precede start date.");
        }
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("A valid leave reason is required.");
        }

        LeaveRequest lr = LeaveRequest.builder()
                .user(user)
                .role(role.toUpperCase())
                .leaveType(request.getLeaveType() != null ? request.getLeaveType() : LeaveRequest.LeaveType.CASUAL)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason().trim())
                .documentUrl(request.getDocumentUrl() != null ? request.getDocumentUrl().trim() : null)
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();

        LeaveRequest saved = leaveRepository.save(lr);

        // Notifications & Audit
        if ("TEACHER".equalsIgnoreCase(role)) {
            notificationService.notifyAdmins(
                    "New Teacher Leave Application",
                    user.getFullName() + " applied for " + saved.getLeaveType() + " leave from " + saved.getStartDate() + " to " + saved.getEndDate() + ".",
                    Notification.NotificationType.INFO
            );
            activityLogService.log(email, "TEACHER_LEAVE_APPLIED", "Applied for " + saved.getLeaveType() + " leave (" + saved.getStartDate() + " to " + saved.getEndDate() + ")", null, ActivityLog.Severity.INFO);
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            // Find student details to notify assigned teachers
            Optional<Student> studentOpt = studentRepository.findByUserEmailWithDetails(email);
            String classInfo = "";
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                classInfo = (s.getSchoolClass() != null ? s.getSchoolClass().getName() : "") +
                            (s.getSection() != null ? " - Sec " + s.getSection().getName() : "");

                if (s.getSchoolClass() != null) {
                    List<TeacherAssignment> assignments = teacherAssignmentRepository.findBySchoolClassId(s.getSchoolClass().getId());
                    List<User> teacherUsers = assignments.stream()
                            .map(ta -> ta.getTeacher().getUser())
                            .filter(Objects::nonNull)
                            .distinct()
                            .toList();

                    notificationService.notifyTeachers(
                            teacherUsers,
                            "New Student Leave Application: " + user.getFullName(),
                            "Scholar " + user.getFullName() + " (" + classInfo + ") applied for " + saved.getLeaveType() + " leave from " + saved.getStartDate() + " to " + saved.getEndDate() + ".",
                            Notification.NotificationType.INFO
                    );
                }
            }

            notificationService.notifyAdmins(
                    "New Student Leave Application: " + user.getFullName(),
                    "Student " + user.getFullName() + " (" + classInfo + ") requested leave from " + saved.getStartDate() + " to " + saved.getEndDate() + ".",
                    Notification.NotificationType.INFO
            );
            activityLogService.log(email, "STUDENT_LEAVE_APPLIED", "Student applied for leave: " + saved.getLeaveType() + " (" + saved.getStartDate() + " to " + saved.getEndDate() + ")", null, ActivityLog.Severity.INFO);
        }

        return mapToDTO(saved);
    }

    @Transactional
    public EnterpriseDTO.LeaveRequestDTO updateStatus(UUID id, LeaveRequest.LeaveStatus status, String remarks, String reviewerEmail) {
        LeaveRequest lr = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (status == LeaveRequest.LeaveStatus.REJECTED && (remarks == null || remarks.trim().isEmpty())) {
            throw new IllegalArgumentException("A rejection reason is mandatory before rejecting a leave application.");
        }

        User reviewer = userRepository.findByEmail(reviewerEmail).orElse(null);

        lr.setStatus(status);
        lr.setReviewedBy(reviewer);
        lr.setReviewerRemarks(remarks != null ? remarks.trim() : null);
        lr.setDecisionAt(ZonedDateTime.now());

        LeaveRequest saved = leaveRepository.save(lr);

        // Notify applicant
        Notification.NotificationType notifType = (status == LeaveRequest.LeaveStatus.APPROVED)
                ? Notification.NotificationType.SUCCESS
                : Notification.NotificationType.ALERT;

        String reviewerName = reviewer != null ? reviewer.getFullName() : "Administration";
        notificationService.sendToUser(
                saved.getUser(),
                "Leave Application " + status.name(),
                "Your " + saved.getLeaveType() + " leave request for " + saved.getStartDate() + " to " + saved.getEndDate() +
                        " has been " + status.name().toLowerCase() + " by " + reviewerName + "." +
                        (remarks != null && !remarks.trim().isEmpty() ? " Remarks: " + remarks.trim() : ""),
                notifType
        );

        activityLogService.log(
                reviewerEmail,
                "LEAVE_REVIEWED_" + status.name(),
                "Leave request for " + saved.getUser().getFullName() + " marked as " + status.name() + ". Remarks: " + remarks,
                null,
                ActivityLog.Severity.INFO
        );

        return mapToDTO(saved);
    }

    @Transactional
    public EnterpriseDTO.LeaveRequestDTO cancel(UUID id, String userEmail) {
        LeaveRequest lr = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!lr.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalArgumentException("Unauthorized: You can only cancel your own leave requests.");
        }

        if (lr.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leave requests can be cancelled. Already " + lr.getStatus().name().toLowerCase() + " applications cannot be modified.");
        }

        lr.setStatus(LeaveRequest.LeaveStatus.CANCELLED);
        lr.setDecisionAt(ZonedDateTime.now());
        LeaveRequest saved = leaveRepository.save(lr);

        notificationService.notifyAdmins(
                "Leave Application Cancelled",
                saved.getUser().getFullName() + " has cancelled their pending " + saved.getLeaveType() + " leave request for " + saved.getStartDate() + " to " + saved.getEndDate() + ".",
                Notification.NotificationType.INFO
        );

        activityLogService.log(
                userEmail,
                "LEAVE_CANCELLED",
                "User cancelled their pending leave request (" + saved.getStartDate() + " to " + saved.getEndDate() + ")",
                null,
                ActivityLog.Severity.INFO
        );

        return mapToDTO(saved);
    }

    @Transactional
    public EnterpriseDTO.LeaveRequestDTO addRecommendation(UUID id, String recommendation, String teacherEmail) {
        LeaveRequest lr = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!"STUDENT".equalsIgnoreCase(lr.getRole())) {
            throw new IllegalArgumentException("Faculty recommendations can only be submitted for student leave requests.");
        }

        User teacherUser = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty user not found"));

        lr.setFacultyRecommendation(recommendation != null ? recommendation.trim() : "");
        lr.setRecommendedBy(teacherUser);
        LeaveRequest saved = leaveRepository.save(lr);

        // Notify Admins
        notificationService.notifyAdmins(
                "Faculty Recommendation Added",
                teacherUser.getFullName() + " added a recommendation for student " + saved.getUser().getFullName() + ": \"" + recommendation + "\"",
                Notification.NotificationType.INFO
        );

        // Notify Student
        notificationService.sendToUser(
                saved.getUser(),
                "Faculty Recommendation Recorded",
                "Your instructor " + teacherUser.getFullName() + " reviewed your leave request: \"" + recommendation + "\"",
                Notification.NotificationType.INFO
        );

        activityLogService.log(
                teacherEmail,
                "FACULTY_RECOMMENDATION_ADDED",
                "Added recommendation for student " + saved.getUser().getFullName() + ": " + recommendation,
                null,
                ActivityLog.Severity.INFO
        );

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public EnterpriseDTO.LeaveStatsDTO getStats() {
        long total = leaveRepository.count();
        long pending = leaveRepository.countByStatus(LeaveRequest.LeaveStatus.PENDING);
        long approved = leaveRepository.countByStatus(LeaveRequest.LeaveStatus.APPROVED);
        long rejected = leaveRepository.countByStatus(LeaveRequest.LeaveStatus.REJECTED);
        long cancelled = leaveRepository.countByStatus(LeaveRequest.LeaveStatus.CANCELLED);

        long tTotal = leaveRepository.countByRole("TEACHER");
        long tPending = leaveRepository.countByRoleAndStatus("TEACHER", LeaveRequest.LeaveStatus.PENDING);
        long tApproved = leaveRepository.countByRoleAndStatus("TEACHER", LeaveRequest.LeaveStatus.APPROVED);
        long tRejected = leaveRepository.countByRoleAndStatus("TEACHER", LeaveRequest.LeaveStatus.REJECTED);

        long sTotal = leaveRepository.countByRole("STUDENT");
        long sPending = leaveRepository.countByRoleAndStatus("STUDENT", LeaveRequest.LeaveStatus.PENDING);
        long sApproved = leaveRepository.countByRoleAndStatus("STUDENT", LeaveRequest.LeaveStatus.APPROVED);
        long sRejected = leaveRepository.countByRoleAndStatus("STUDENT", LeaveRequest.LeaveStatus.REJECTED);

        return EnterpriseDTO.LeaveStatsDTO.builder()
                .total(total)
                .pending(pending)
                .approved(approved)
                .rejected(rejected)
                .cancelled(cancelled)
                .teacherTotal(tTotal)
                .teacherPending(tPending)
                .teacherApproved(tApproved)
                .teacherRejected(tRejected)
                .studentTotal(sTotal)
                .studentPending(sPending)
                .studentApproved(sApproved)
                .studentRejected(sRejected)
                .build();
    }

    private EnterpriseDTO.LeaveRequestDTO mapToDTO(LeaveRequest l) {
        String studentRoll = null;
        String studentCode = null;
        String className = null;
        String sectionName = null;
        String department = null;

        if ("STUDENT".equalsIgnoreCase(l.getRole())) {
            Optional<Student> stOpt = studentRepository.findByUserIdWithDetails(l.getUser().getId());
            if (stOpt.isPresent()) {
                Student s = stOpt.get();
                studentRoll = s.getRollNumber();
                studentCode = s.getStudentId();
                if (s.getSchoolClass() != null) className = s.getSchoolClass().getName();
                if (s.getSection() != null) sectionName = s.getSection().getName();
            }
        } else if ("TEACHER".equalsIgnoreCase(l.getRole())) {
            Optional<Teacher> tOpt = teacherRepository.findByUserId(l.getUser().getId());
            if (tOpt.isPresent()) {
                Teacher t = tOpt.get();
                department = t.getSpecialization();
            }
        }

        return EnterpriseDTO.LeaveRequestDTO.builder()
                .id(l.getId())
                .userId(l.getUser().getId())
                .userFullName(l.getUser().getFullName())
                .userEmail(l.getUser().getEmail())
                .role(l.getRole())
                .leaveType(l.getLeaveType())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .reason(l.getReason())
                .status(l.getStatus())
                .documentUrl(l.getDocumentUrl())
                .facultyRecommendation(l.getFacultyRecommendation())
                .recommendedById(l.getRecommendedBy() != null ? l.getRecommendedBy().getId() : null)
                .recommendedByName(l.getRecommendedBy() != null ? l.getRecommendedBy().getFullName() : null)
                .reviewerId(l.getReviewedBy() != null ? l.getReviewedBy().getId() : null)
                .reviewerName(l.getReviewedBy() != null ? l.getReviewedBy().getFullName() : null)
                .reviewerRemarks(l.getReviewerRemarks())
                .decisionAt(l.getDecisionAt())
                .createdAt(l.getCreatedAt())
                .studentRollNumber(studentRoll)
                .studentCode(studentCode)
                .className(className)
                .sectionName(sectionName)
                .department(department)
                .build();
    }
}
