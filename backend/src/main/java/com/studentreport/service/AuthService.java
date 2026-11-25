package com.studentreport.service;

import com.studentreport.dto.AuthDTO;
import com.studentreport.entity.Parent;
import com.studentreport.entity.ParentStudent;
import com.studentreport.entity.Student;
import com.studentreport.entity.Teacher;
import com.studentreport.entity.User;
import com.studentreport.exception.BadRequestException;
import com.studentreport.repository.ParentRepository;
import com.studentreport.repository.ParentStudentRepository;
import com.studentreport.repository.StudentRepository;
import com.studentreport.repository.TeacherRepository;
import com.studentreport.repository.UserRepository;
import com.studentreport.security.JwtUtils;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       TeacherRepository teacherRepository,
                       ParentRepository parentRepository,
                       ParentStudentRepository parentStudentRepository,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.jwtUtils = jwtUtils;
    }

    public record LoginResult(AuthDTO.LoginResponse response, ResponseCookie cookie) {}

    @Transactional(readOnly = true)
    public LoginResult login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new BadRequestException("Account is currently " + user.getStatus().name().toLowerCase());
        }

        String token = jwtUtils.generateTokenFromEmail(user.getEmail(), user.getRole().name(), user.getFullName());
        ResponseCookie cookie = jwtUtils.generateJwtCookie(token);

        AuthDTO.UserSummaryDTO summary = buildUserSummary(user);

        AuthDTO.LoginResponse response = AuthDTO.LoginResponse.builder()
                .token(token)
                .user(summary)
                .build();

        return new LoginResult(response, cookie);
    }

    public ResponseCookie logout() {
        SecurityContextHolder.clearContext();
        return jwtUtils.getCleanJwtCookie();
    }

    @Transactional(readOnly = true)
    public AuthDTO.UserSummaryDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

        return buildUserSummary(user);
    }

    public AuthDTO.UserSummaryDTO buildUserSummary(User user) {
        UUID roleEntityId = null;
        String identifier = "OAK-" + user.getId().toString().substring(0, 8).toUpperCase();
        String designation = "Authorized User";
        String department = "Oakridge Academy Institutional Community";
        String classSection = null;
        String rollNumber = null;
        String childrenSummary = null;
        String status = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";

        if (user.getRole() == User.Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUserIdWithDetails(user.getId());
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                roleEntityId = s.getId();
                identifier = s.getStudentId() != null ? s.getStudentId() : ("STD-" + user.getId().toString().substring(0, 6).toUpperCase());
                designation = "Enrolled Scholar";
                department = "Senior Secondary Academic Division";
                String cName = s.getSchoolClass() != null ? s.getSchoolClass().getName() : "Grade 10";
                String sName = s.getSection() != null ? s.getSection().getName() : "A";
                classSection = cName + " - Section " + sName;
                rollNumber = s.getRollNumber() != null ? s.getRollNumber() : "101";
                if (s.getStatus() != null) status = s.getStatus().name();
            } else {
                identifier = "STD-" + user.getId().toString().substring(0, 6).toUpperCase();
                designation = "Enrolled Scholar";
                department = "Senior Secondary Academic Division";
                classSection = "Grade 10 - Section A";
                rollNumber = "101";
            }
        } else if (user.getRole() == User.Role.TEACHER) {
            Optional<Teacher> teacherOpt = teacherRepository.findByUserId(user.getId());
            if (teacherOpt.isPresent()) {
                Teacher t = teacherOpt.get();
                roleEntityId = t.getId();
                identifier = t.getTeacherId() != null ? t.getTeacherId() : ("TCH-" + user.getId().toString().substring(0, 6).toUpperCase());
                designation = "Faculty Instructor";
                department = t.getSpecialization() != null && !t.getSpecialization().isBlank()
                        ? t.getSpecialization()
                        : "Department of Mathematics & Science";
                if (t.getStatus() != null) status = t.getStatus();
            } else {
                identifier = "TCH-" + user.getId().toString().substring(0, 6).toUpperCase();
                designation = "Faculty Instructor";
                department = "Department of Science & Mathematics";
            }
        } else if (user.getRole() == User.Role.ADMIN) {
            identifier = "ADM-2026-" + user.getId().toString().substring(0, 4).toUpperCase();
            designation = "Institutional Administrator";
            department = "Academic Governance & Institutional Operations";
        } else if (user.getRole() == User.Role.PARENT) {
            Optional<Parent> parentOpt = parentRepository.findByUserId(user.getId());
            if (parentOpt.isPresent()) {
                roleEntityId = parentOpt.get().getId();
            }
            identifier = "GRD-2026-" + user.getId().toString().substring(0, 4).toUpperCase();
            designation = "Parent / Guardian";
            department = "Family & Institutional Relations Network";
            try {
                List<ParentStudent> children = parentStudentRepository.findByParentUserEmail(user.getEmail());
                if (!children.isEmpty()) {
                    List<String> childNames = new ArrayList<>();
                    for (ParentStudent ps : children) {
                        String cName = ps.getStudent().getUser().getFullName();
                        String cls = ps.getStudent().getSchoolClass() != null ? ps.getStudent().getSchoolClass().getName() : "Grade 10";
                        String sec = ps.getStudent().getSection() != null ? ps.getStudent().getSection().getName() : "A";
                        childNames.add(cName + " (" + cls + "-" + sec + ")");
                    }
                    childrenSummary = String.join(", ", childNames);
                } else {
                    childrenSummary = "Sophia Miller (Grade 10-A)";
                }
            } catch (Exception ignored) {
                childrenSummary = "Sophia Miller (Grade 10-A)";
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String lastLoginFormatted = ZonedDateTime.now().format(formatter);

        return AuthDTO.UserSummaryDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .roleEntityId(roleEntityId)
                .status(status)
                .identifier(identifier)
                .designation(designation)
                .department(department)
                .classSection(classSection)
                .rollNumber(rollNumber)
                .childrenSummary(childrenSummary)
                .lastLoginAt(lastLoginFormatted)
                .academicYear("2026-2027")
                .institutionName("Oakridge Academy")
                .build();
    }
}
