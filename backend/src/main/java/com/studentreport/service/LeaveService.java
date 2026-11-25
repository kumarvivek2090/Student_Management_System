package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.LeaveRequest;
import com.studentreport.entity.User;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.LeaveRequestRepository;
import com.studentreport.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;

    public LeaveService(LeaveRequestRepository leaveRepository, UserRepository userRepository) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LeaveRequestDTO> getAll() {
        return leaveRepository.findAllWithDetails().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.LeaveRequestDTO> getMyLeaves(String email) {
        return leaveRepository.findByUserEmailWithDetails(email).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.LeaveRequestDTO apply(EnterpriseDTO.ApplyLeaveRequest request, String email, String role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LeaveRequest lr = LeaveRequest.builder()
                .user(user)
                .role(role)
                .leaveType(request.getLeaveType() != null ? request.getLeaveType() : LeaveRequest.LeaveType.CASUAL)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();

        return mapToDTO(leaveRepository.save(lr));
    }

    @Transactional
    public EnterpriseDTO.LeaveRequestDTO updateStatus(UUID id, LeaveRequest.LeaveStatus status, String remarks, String reviewerEmail) {
        LeaveRequest lr = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        User reviewer = userRepository.findByEmail(reviewerEmail).orElse(null);

        lr.setStatus(status);
        lr.setReviewedBy(reviewer);
        lr.setReviewerRemarks(remarks);

        return mapToDTO(leaveRepository.save(lr));
    }

    private EnterpriseDTO.LeaveRequestDTO mapToDTO(LeaveRequest l) {
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
                .reviewerRemarks(l.getReviewerRemarks())
                .createdAt(l.getCreatedAt())
                .build();
    }
}
