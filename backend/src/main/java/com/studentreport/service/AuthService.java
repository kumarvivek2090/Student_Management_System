package com.studentreport.service;

import com.studentreport.dto.AuthDTO;
import com.studentreport.entity.Parent;
import com.studentreport.entity.Student;
import com.studentreport.entity.Teacher;
import com.studentreport.entity.User;
import com.studentreport.exception.BadRequestException;
import com.studentreport.repository.ParentRepository;
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

import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       TeacherRepository teacherRepository,
                       ParentRepository parentRepository,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.parentRepository = parentRepository;
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

        UUID roleEntityId = null;
        if (user.getRole() == User.Role.STUDENT) {
            roleEntityId = studentRepository.findByUserId(user.getId()).map(Student::getId).orElse(null);
        } else if (user.getRole() == User.Role.TEACHER) {
            roleEntityId = teacherRepository.findByUserId(user.getId()).map(Teacher::getId).orElse(null);
        } else if (user.getRole() == User.Role.PARENT) {
            roleEntityId = parentRepository.findByUserId(user.getId()).map(Parent::getId).orElse(null);
        }

        AuthDTO.UserSummaryDTO summary = AuthDTO.UserSummaryDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .roleEntityId(roleEntityId)
                .build();

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

        UUID roleEntityId = null;
        if (user.getRole() == User.Role.STUDENT) {
            roleEntityId = studentRepository.findByUserId(user.getId()).map(Student::getId).orElse(null);
        } else if (user.getRole() == User.Role.TEACHER) {
            roleEntityId = teacherRepository.findByUserId(user.getId()).map(Teacher::getId).orElse(null);
        } else if (user.getRole() == User.Role.PARENT) {
            roleEntityId = parentRepository.findByUserId(user.getId()).map(Parent::getId).orElse(null);
        }

        return AuthDTO.UserSummaryDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .roleEntityId(roleEntityId)
                .build();
    }
}
