package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.User;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService logService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       ActivityLogService logService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.UserSummaryDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.UserSummaryDTO createUser(EnterpriseDTO.CreateUserRequest request, String creatorEmail) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User.Role role = User.Role.valueOf(request.getRole().toUpperCase());

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        logService.log(creatorEmail, "USER_CREATED", "Created user " + user.getEmail() + " (" + role + ")", null, null);
        return mapToDTO(user);
    }

    @Transactional
    public EnterpriseDTO.UserSummaryDTO toggleStatus(UUID id, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() == User.UserStatus.ACTIVE) {
            user.setStatus(User.UserStatus.SUSPENDED);
        } else {
            user.setStatus(User.UserStatus.ACTIVE);
        }

        user = userRepository.save(user);
        logService.log(adminEmail, "USER_STATUS_CHANGE", "Updated status of " + user.getEmail() + " to " + user.getStatus(), null, null);
        return mapToDTO(user);
    }

    @Transactional
    public void resetPassword(UUID id, String newPassword, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logService.log(adminEmail, "PASSWORD_RESET", "Reset credentials for " + user.getEmail(), null, null);
    }

    private EnterpriseDTO.UserSummaryDTO mapToDTO(User u) {
        return EnterpriseDTO.UserSummaryDTO.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .status(u.getStatus().name())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
