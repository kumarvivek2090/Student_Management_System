package com.studentreport.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.studentreport.dto.RemarkDTO;
import com.studentreport.dto.ReportDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportCardService {

    private final ReportCardRepository reportCardRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final AssessmentMarkRepository markRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final TeacherRemarkRepository remarkRepository;
    private final GradingScaleRepository gradingScaleRepository;
    private final AppSettingRepository appSettingRepository;

    public ReportCardService(ReportCardRepository reportCardRepository,
                             StudentRepository studentRepository,
                             AcademicYearRepository academicYearRepository,
                             SemesterRepository semesterRepository,
                             AssessmentMarkRepository markRepository,
                             AttendanceRecordRepository attendanceRepository,
                             TeacherRemarkRepository remarkRepository,
                             GradingScaleRepository gradingScaleRepository,
                             AppSettingRepository appSettingRepository) {
        this.reportCardRepository = reportCardRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.markRepository = markRepository;
        this.attendanceRepository = attendanceRepository;
        this.remarkRepository = remarkRepository;
        this.gradingScaleRepository = gradingScaleRepository;
        this.appSettingRepository = appSettingRepository;
    }

    @Transactional
    public ReportDTO.ReportCardResponseDTO generateOrGetReportCard(UUID studentId, UUID academicYearId, UUID semesterId) {
        Student student = studentRepository.findByIdWithDetails(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        AcademicYear year = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));
        Semester sem = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found"));

        // Fetch marks for this student
        List<AssessmentMark> marks = markRepository.findDetailedMarksByStudentId(studentId);

        // Filter marks matching semester/year
        List<AssessmentMark> semesterMarks = marks.stream()
                .filter(m -> m.getAssessment().getExamination().getAcademicYear().getId().equals(academicYearId)
                        && m.getAssessment().getExamination().getSemester().getId().equals(semesterId))
                .collect(Collectors.toList());

        // Group by subject to calculate subject summaries
        Map<Subject, List<AssessmentMark>> bySubject = semesterMarks.stream()
                .collect(Collectors.groupingBy(m -> m.getAssessment().getSubject()));

        List<ReportDTO.SubjectResultDTO> subjectResults = new ArrayList<>();
        BigDecimal totalMax = BigDecimal.ZERO;
        BigDecimal totalObtained = BigDecimal.ZERO;

        for (Map.Entry<Subject, List<AssessmentMark>> entry : bySubject.entrySet()) {
            Subject subj = entry.getKey();
            List<AssessmentMark> subMarks = entry.getValue();

            BigDecimal subMax = BigDecimal.ZERO;
            BigDecimal subObt = BigDecimal.ZERO;

            for (AssessmentMark m : subMarks) {
                if (m.getAssessment().getMaxMarks() != null) {
                    subMax = subMax.add(m.getAssessment().getMaxMarks());
                }
                if (m.getObtainedMarks() != null && !Boolean.TRUE.equals(m.getIsAbsent())) {
                    subObt = subObt.add(m.getObtainedMarks());
                }
            }

            BigDecimal subPct = BigDecimal.ZERO;
            if (subMax.compareTo(BigDecimal.ZERO) > 0) {
                subPct = subObt.divide(subMax, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            }

            String grade = calculateGrade(subPct);

            subjectResults.add(ReportDTO.SubjectResultDTO.builder()
                    .subjectId(subj.getId())
                    .subjectName(subj.getName())
                    .subjectCode(subj.getCode())
                    .credits(subj.getCredits())
                    .maxMarks(subMax)
                    .obtainedMarks(subObt)
                    .percentage(subPct)
                    .grade(grade)
                    .remarks(subPct.compareTo(BigDecimal.valueOf(40)) >= 0 ? "PASSED" : "NEEDS IMPROVEMENT")
                    .build());

            totalMax = totalMax.add(subMax);
            totalObtained = totalObtained.add(subObt);
        }

        BigDecimal overallPercentage = BigDecimal.ZERO;
        if (totalMax.compareTo(BigDecimal.ZERO) > 0) {
            overallPercentage = totalObtained.divide(totalMax, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }

        String overallGrade = calculateGrade(overallPercentage);

        // Attendance %
        long totalAtt = attendanceRepository.countByStudentId(studentId);
        long presentAtt = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceRecord.AttendanceStatus.PRESENT)
                + attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceRecord.AttendanceStatus.LATE);
        BigDecimal attPercentage = BigDecimal.ZERO;
        if (totalAtt > 0) {
            attPercentage = BigDecimal.valueOf(presentAtt).divide(BigDecimal.valueOf(totalAtt), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }

        // Persist ReportCard record in Neon
        ReportCard reportCard = reportCardRepository.findByStudentIdAndAcademicYearIdAndSemesterId(studentId, academicYearId, semesterId)
                .orElseGet(() -> ReportCard.builder()
                        .student(student)
                        .academicYear(year)
                        .semester(sem)
                        .build());

        reportCard.setTotalMarks(totalMax);
        reportCard.setObtainedMarks(totalObtained);
        reportCard.setPercentage(overallPercentage);
        reportCard.setOverallGrade(overallGrade);
        reportCard.setAttendancePercentage(attPercentage);
        reportCard.setStatus(ReportCard.ReportStatus.PUBLISHED);
        reportCard.setIssuedDate(LocalDate.now());

        reportCard = reportCardRepository.save(reportCard);

        // Get remarks
        List<TeacherRemark> remarks = remarkRepository.findPublishedByStudentWithDetails(studentId);
        List<RemarkDTO.RemarkResponseDTO> remarkDTOs = remarks.stream()
                .map(r -> RemarkDTO.RemarkResponseDTO.builder()
                        .id(r.getId())
                        .category(r.getCategory())
                        .description(r.getDescription())
                        .teacherFullName(r.getTeacher().getUser().getFullName())
                        .subjectName(r.getSubject() != null ? r.getSubject().getName() : "General")
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        String instName = appSettingRepository.findBySettingKey("INSTITUTION_NAME")
                .map(AppSetting::getSettingValue).orElse("Oakridge International Academy");
        String instAddr = appSettingRepository.findBySettingKey("INSTITUTION_ADDRESS")
                .map(AppSetting::getSettingValue).orElse("452 Academy Way, Cambridge, MA");

        return ReportDTO.ReportCardResponseDTO.builder()
                .id(reportCard.getId())
                .studentId(student.getId())
                .studentFullName(student.getUser().getFullName())
                .studentCode(student.getStudentId())
                .rollNumber(student.getRollNumber())
                .className(student.getSchoolClass() != null ? student.getSchoolClass().getName() : "N/A")
                .sectionName(student.getSection() != null ? student.getSection().getName() : "N/A")
                .academicYearName(year.getName())
                .semesterName(sem.getName())
                .issuedDate(reportCard.getIssuedDate())
                .status(reportCard.getStatus())
                .totalMaxMarks(totalMax)
                .totalObtainedMarks(totalObtained)
                .percentage(overallPercentage)
                .overallGrade(overallGrade)
                .attendancePercentage(attPercentage)
                .institutionName(instName)
                .institutionAddress(instAddr)
                .subjects(subjectResults)
                .teacherRemarks(remarkDTOs)
                .build();
    }

    public String calculateGrade(BigDecimal percentage) {
        if (percentage == null) return "N/A";
        return gradingScaleRepository.findGradeForPercentage(percentage)
                .map(GradingScale::getGrade)
                .orElse("F");
    }

    @Transactional(readOnly = true)
    public byte[] generatePdfReport(UUID studentId, UUID academicYearId, UUID semesterId) {
        ReportDTO.ReportCardResponseDTO report = generateOrGetReportCard(studentId, academicYearId, semesterId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Brand Colors
            Color oliveGreen = new Color(105, 116, 74);
            Color forestOlive = new Color(65, 75, 50);
            Color warmCream = new Color(240, 239, 228);
            Color paleSage = new Color(229, 233, 220);
            Color charcoal = new Color(41, 44, 36);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, forestOlive);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(119, 121, 109));
            Font sectionTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, oliveGreen);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, charcoal);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 9, charcoal);
            Font whiteBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            // 1. Header
            Paragraph inst = new Paragraph(report.getInstitutionName().toUpperCase(), titleFont);
            inst.setAlignment(Element.ALIGN_CENTER);
            document.add(inst);

            Paragraph addr = new Paragraph(report.getInstitutionAddress() + " | OFFICIAL ACADEMIC REPORT", subtitleFont);
            addr.setAlignment(Element.ALIGN_CENTER);
            document.add(addr);

            document.add(new Paragraph(" "));

            // 2. Student Info Card
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(5);
            infoTable.setSpacingAfter(15);

            addInfoCell(infoTable, "Student Name:", report.getStudentFullName(), boldFont, regularFont, paleSage);
            addInfoCell(infoTable, "Student ID:", report.getStudentCode(), boldFont, regularFont, paleSage);
            addInfoCell(infoTable, "Roll Number:", report.getRollNumber(), boldFont, regularFont, Color.WHITE);
            addInfoCell(infoTable, "Class & Section:", report.getClassName() + " - " + report.getSectionName(), boldFont, regularFont, Color.WHITE);
            addInfoCell(infoTable, "Academic Year:", report.getAcademicYearName(), boldFont, regularFont, paleSage);
            addInfoCell(infoTable, "Semester:", report.getSemesterName(), boldFont, regularFont, paleSage);
            addInfoCell(infoTable, "Issue Date:", report.getIssuedDate().toString(), boldFont, regularFont, Color.WHITE);
            addInfoCell(infoTable, "Attendance Rate:", report.getAttendancePercentage() + "%", boldFont, regularFont, Color.WHITE);

            document.add(infoTable);

            // 3. Academic Performance Table
            Paragraph perfHeader = new Paragraph("ACADEMIC PERFORMANCE", sectionTitle);
            perfHeader.setSpacingAfter(8);
            document.add(perfHeader);

            PdfPTable marksTable = new PdfPTable(6);
            marksTable.setWidthPercentage(100);
            marksTable.setWidths(new float[]{3.0f, 1.2f, 1.2f, 1.2f, 1.0f, 1.8f});

            // Headers
            String[] headers = {"Subject", "Max Marks", "Obtained", "Percentage", "Grade", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, whiteBold));
                cell.setBackgroundColor(oliveGreen);
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                marksTable.addCell(cell);
            }

            // Rows
            boolean alt = false;
            for (ReportDTO.SubjectResultDTO sub : report.getSubjects()) {
                Color rowBg = alt ? warmCream : Color.WHITE;
                alt = !alt;

                addTableRow(marksTable, sub.getSubjectName() + " (" + sub.getSubjectCode() + ")", Element.ALIGN_LEFT, regularFont, rowBg);
                addTableRow(marksTable, sub.getMaxMarks().toString(), Element.ALIGN_CENTER, regularFont, rowBg);
                addTableRow(marksTable, sub.getObtainedMarks().toString(), Element.ALIGN_CENTER, regularFont, rowBg);
                addTableRow(marksTable, sub.getPercentage() + "%", Element.ALIGN_CENTER, regularFont, rowBg);
                addTableRow(marksTable, sub.getGrade(), Element.ALIGN_CENTER, boldFont, rowBg);
                addTableRow(marksTable, sub.getRemarks(), Element.ALIGN_CENTER, regularFont, rowBg);
            }

            document.add(marksTable);

            // 4. Result Summary Card
            document.add(new Paragraph(" "));
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(10);
            summaryTable.setSpacingAfter(15);

            addSummaryCell(summaryTable, "Total Maximum Marks", report.getTotalMaxMarks().toString(), forestOlive, paleSage);
            addSummaryCell(summaryTable, "Total Marks Obtained", report.getTotalObtainedMarks().toString(), forestOlive, paleSage);
            addSummaryCell(summaryTable, "Overall Percentage", report.getPercentage() + "%", forestOlive, paleSage);
            addSummaryCell(summaryTable, "Overall Final Grade", report.getOverallGrade(), forestOlive, paleSage);

            document.add(summaryTable);

            // 5. Remarks Section
            if (!report.getTeacherRemarks().isEmpty()) {
                Paragraph remHeader = new Paragraph("INSTRUCTOR & COUNSELOR REMARKS", sectionTitle);
                remHeader.setSpacingAfter(5);
                document.add(remHeader);

                for (RemarkDTO.RemarkResponseDTO r : report.getTeacherRemarks()) {
                    Paragraph rp = new Paragraph("• [" + r.getCategory() + " - " + r.getTeacherFullName() + "]: " + r.getDescription(), regularFont);
                    rp.setSpacingAfter(4);
                    document.add(rp);
                }
            }

            // 6. Signature Footers
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);

            PdfPCell sig1 = new PdfPCell(new Phrase("_________________________\nClass Teacher Signature", regularFont));
            sig1.setBorder(Rectangle.NO_BORDER);
            sig1.setHorizontalAlignment(Element.ALIGN_LEFT);

            PdfPCell sig2 = new PdfPCell(new Phrase("_________________________\nPrincipal Signature / Seal", regularFont));
            sig2.setBorder(Rectangle.NO_BORDER);
            sig2.setHorizontalAlignment(Element.ALIGN_RIGHT);

            sigTable.addCell(sig1);
            sigTable.addCell(sig2);
            document.add(sigTable);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font labelFont, Font valFont, Color bg) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBackgroundColor(bg);
        c1.setPadding(4);
        c1.setBorderColor(new Color(230, 228, 217));
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value != null ? value : "—", valFont));
        c2.setBackgroundColor(bg);
        c2.setPadding(4);
        c2.setBorderColor(new Color(230, 228, 217));
        table.addCell(c2);
    }

    private void addTableRow(PdfPTable table, String text, int align, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(align);
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setBorderColor(new Color(230, 228, 217));
        table.addCell(cell);
    }

    private void addSummaryCell(PdfPTable table, String title, String val, Color textCol, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setBorderColor(new Color(105, 116, 74));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p1 = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY));
        p1.setAlignment(Element.ALIGN_CENTER);
        Paragraph p2 = new Paragraph(val, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, textCol));
        p2.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(p1);
        cell.addElement(p2);
        table.addCell(cell);
    }
}
