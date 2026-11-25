package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeeService {

    private final StudentFeeRepository studentFeeRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final UserRepository userRepository;

    public FeeService(StudentFeeRepository studentFeeRepository,
                      FeePaymentRepository feePaymentRepository,
                      UserRepository userRepository) {
        this.studentFeeRepository = studentFeeRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public EnterpriseDTO.FeeOverviewDTO getOverview() {
        BigDecimal billed = studentFeeRepository.sumTotalBilled();
        BigDecimal collected = studentFeeRepository.sumTotalCollected();
        BigDecimal pending = studentFeeRepository.sumPendingDues();
        List<StudentFee> all = studentFeeRepository.findAll();
        long paidCount = all.stream().filter(f -> f.getStatus() == StudentFee.FeeStatus.PAID).count();
        long pendingCount = all.size() - paidCount;

        return EnterpriseDTO.FeeOverviewDTO.builder()
                .totalBilled(billed != null ? billed : BigDecimal.ZERO)
                .totalCollected(collected != null ? collected : BigDecimal.ZERO)
                .pendingDues(pending != null ? pending : BigDecimal.ZERO)
                .totalInvoices(all.size())
                .paidInvoices(paidCount)
                .pendingInvoices(pendingCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.StudentFeeDTO> getAllStudentFees() {
        return studentFeeRepository.findAllWithDetails().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.StudentFeeDTO> getFeesByStudentEmail(String email) {
        return studentFeeRepository.findByStudentEmailWithDetails(email).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.StudentFeeDTO> getFeesByStudentId(UUID studentId) {
        return studentFeeRepository.findByStudentIdWithDetails(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.StudentFeeDTO recordPayment(EnterpriseDTO.RecordPaymentRequest request, String receiverEmail) {
        StudentFee fee = studentFeeRepository.findById(request.getStudentFeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee invoice not found"));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        BigDecimal newPaid = fee.getPaidAmount().add(request.getAmount());
        if (newPaid.compareTo(fee.getTotalAmount()) > 0) {
            throw new BadRequestException("Total payments cannot exceed invoice amount");
        }

        fee.setPaidAmount(newPaid);
        if (newPaid.compareTo(fee.getTotalAmount()) >= 0) {
            fee.setStatus(StudentFee.FeeStatus.PAID);
        } else {
            fee.setStatus(StudentFee.FeeStatus.PARTIAL);
        }

        User receiver = userRepository.findByEmail(receiverEmail).orElse(null);

        FeePayment payment = FeePayment.builder()
                .studentFee(fee)
                .receiptNumber("REC-" + System.currentTimeMillis() % 1000000)
                .amountPaid(request.getAmount())
                .paymentDate(LocalDate.now())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : FeePayment.PaymentMethod.ONLINE)
                .transactionReference(request.getTransactionReference())
                .receivedBy(receiver)
                .build();

        feePaymentRepository.save(payment);
        fee.getPayments().add(payment);
        return mapToDTO(studentFeeRepository.save(fee));
    }

    private EnterpriseDTO.StudentFeeDTO mapToDTO(StudentFee f) {
        BigDecimal balance = f.getTotalAmount().subtract(f.getPaidAmount());
        List<EnterpriseDTO.FeePaymentDTO> paymentDTOs = f.getPayments().stream()
                .map(p -> EnterpriseDTO.FeePaymentDTO.builder()
                        .id(p.getId())
                        .receiptNumber(p.getReceiptNumber())
                        .amountPaid(p.getAmountPaid())
                        .paymentDate(p.getPaymentDate())
                        .paymentMethod(p.getPaymentMethod())
                        .transactionReference(p.getTransactionReference())
                        .build())
                .collect(Collectors.toList());

        return EnterpriseDTO.StudentFeeDTO.builder()
                .id(f.getId())
                .studentId(f.getStudent().getId())
                .studentFullName(f.getStudent().getUser() != null ? f.getStudent().getUser().getFullName() : "Student")
                .studentCode(f.getStudent().getStudentId())
                .rollNumber(f.getStudent().getRollNumber())
                .className(f.getStudent().getSchoolClass() != null ? f.getStudent().getSchoolClass().getName() : "Grade 10")
                .sectionName(f.getStudent().getSection() != null ? f.getStudent().getSection().getName() : "A")
                .invoiceNumber(f.getInvoiceNumber())
                .feeTitle(f.getFeeStructure() != null ? f.getFeeStructure().getTitle() : "Institutional Tuition & Assessment Fee")
                .totalAmount(f.getTotalAmount())
                .paidAmount(f.getPaidAmount())
                .balanceAmount(balance.compareTo(BigDecimal.ZERO) > 0 ? balance : BigDecimal.ZERO)
                .dueDate(f.getDueDate())
                .status(f.getStatus())
                .remarks(f.getRemarks())
                .payments(paymentDTOs)
                .build();
    }
}
