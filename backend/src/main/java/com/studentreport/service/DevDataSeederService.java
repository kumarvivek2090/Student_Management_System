package com.studentreport.service;

import com.studentreport.entity.*;
import com.studentreport.repository.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DevDataSeederService {

    private static final Logger logger = LoggerFactory.getLogger(DevDataSeederService.class);

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final TeacherAssignmentRepository assignmentRepository;
    private final ExaminationRepository examinationRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository markRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final TeacherRemarkRepository remarkRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    public DevDataSeederService(UserRepository userRepository,
                                TeacherRepository teacherRepository,
                                StudentRepository studentRepository,
                                ParentRepository parentRepository,
                                ParentStudentRepository parentStudentRepository,
                                SchoolClassRepository classRepository,
                                SectionRepository sectionRepository,
                                SubjectRepository subjectRepository,
                                AcademicYearRepository academicYearRepository,
                                SemesterRepository semesterRepository,
                                TeacherAssignmentRepository assignmentRepository,
                                ExaminationRepository examinationRepository,
                                AssessmentRepository assessmentRepository,
                                AssessmentMarkRepository markRepository,
                                AttendanceRecordRepository attendanceRepository,
                                TeacherRemarkRepository remarkRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.assignmentRepository = assignmentRepository;
        this.examinationRepository = examinationRepository;
        this.assessmentRepository = assessmentRepository;
        this.markRepository = markRepository;
        this.attendanceRepository = attendanceRepository;
        this.remarkRepository = remarkRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    @Transactional
    public void init() {
        ensureAdminUserExists();
        if (seedEnabled) {
            seedDemoData();
        }
    }

    @Transactional
    public void ensureAdminUserExists() {
        if (!userRepository.existsByEmail("admin@studentreport.com")) {
            User admin = User.builder()
                    .email("admin@studentreport.com")
                    .fullName("Institutional Administrator")
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .phone("+1 (555) 019-2831")
                    .role(User.Role.ADMIN)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            logger.info("Created default system administrator: admin@studentreport.com / Password@123");
        }
    }

    @Transactional
    public void seedDemoData() {
        logger.info("Initializing controlled academic demonstration data...");

        // 1. Academic Year & Semester
        AcademicYear year2026 = academicYearRepository.findByName("2026-2027").orElseGet(() -> {
            AcademicYear y = AcademicYear.builder()
                    .name("2026-2027")
                    .startDate(LocalDate.of(2026, 8, 15))
                    .endDate(LocalDate.of(2027, 6, 15))
                    .isCurrent(true)
                    .build();
            return academicYearRepository.save(y);
        });

        Semester fallSem = semesterRepository.findByAcademicYearId(year2026.getId()).stream()
                .filter(s -> s.getName().equals("Fall 2026")).findFirst().orElseGet(() -> {
                    Semester s = Semester.builder()
                            .academicYear(year2026)
                            .name("Fall 2026")
                            .startDate(LocalDate.of(2026, 8, 15))
                            .endDate(LocalDate.of(2026, 12, 20))
                            .isCurrent(true)
                            .build();
                    return semesterRepository.save(s);
                });

        semesterRepository.findByAcademicYearId(year2026.getId()).stream()
                .filter(s -> s.getName().equals("Spring 2027")).findFirst().orElseGet(() -> {
                    Semester s = Semester.builder()
                            .academicYear(year2026)
                            .name("Spring 2027")
                            .startDate(LocalDate.of(2027, 1, 10))
                            .endDate(LocalDate.of(2027, 6, 15))
                            .isCurrent(false)
                            .build();
                    return semesterRepository.save(s);
                });

        // 2. Classes & Sections
        SchoolClass class10 = classRepository.findByName("Grade 10").orElseGet(() -> {
            SchoolClass c = SchoolClass.builder().name("Grade 10").gradeLevel(10).description("Secondary Sophomore Level").build();
            return classRepository.save(c);
        });

        classRepository.findByName("Grade 11").orElseGet(() -> {
            SchoolClass c = SchoolClass.builder().name("Grade 11").gradeLevel(11).description("Higher Secondary Junior Level").build();
            return classRepository.save(c);
        });

        Section sec10A = sectionRepository.findBySchoolClassIdAndName(class10.getId(), "A").orElseGet(() -> {
            Section s = Section.builder().schoolClass(class10).name("A").capacity(35).roomNumber("Room 101").build();
            return sectionRepository.save(s);
        });

        sectionRepository.findBySchoolClassIdAndName(class10.getId(), "B").orElseGet(() -> {
            Section s = Section.builder().schoolClass(class10).name("B").capacity(35).roomNumber("Room 102").build();
            return sectionRepository.save(s);
        });

        // 3. Subjects
        Subject math = subjectRepository.findByCode("MATH101").orElseGet(() -> {
            Subject s = Subject.builder().name("Advanced Mathematics").code("MATH101").credits(4).description("Calculus and Algebraic Structures").build();
            return subjectRepository.save(s);
        });

        Subject physics = subjectRepository.findByCode("PHYS101").orElseGet(() -> {
            Subject s = Subject.builder().name("Applied Physics").code("PHYS101").credits(4).description("Mechanics, Optics, and Thermodynamics").build();
            return subjectRepository.save(s);
        });

        subjectRepository.findByCode("ENG101").orElseGet(() -> {
            Subject s = Subject.builder().name("English Literature").code("ENG101").credits(3).description("Literary Analysis and Composition").build();
            return subjectRepository.save(s);
        });

        subjectRepository.findByCode("CS101").orElseGet(() -> {
            Subject s = Subject.builder().name("Computer Science").code("CS101").credits(3).description("Algorithms, Data Structures, and Software Design").build();
            return subjectRepository.save(s);
        });

        // 4. Teachers
        User tUser1 = userRepository.findByEmail("eleanor.vance@studentreport.com").orElseGet(() -> {
            User u = User.builder()
                    .email("eleanor.vance@studentreport.com")
                    .fullName("Dr. Eleanor Vance")
                    .phone("+1 (555) 234-7890")
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .role(User.Role.TEACHER)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(u);
        });

        Teacher teacher1 = teacherRepository.findByUserId(tUser1.getId()).orElseGet(() -> {
            Teacher t = Teacher.builder()
                    .user(tUser1)
                    .teacherId("TCH-1001")
                    .qualification("Ph.D. in Pure Mathematics")
                    .specialization("Calculus & Numerical Methods")
                    .build();
            return teacherRepository.save(t);
        });

        User tUser2 = userRepository.findByEmail("arthur.pendelton@studentreport.com").orElseGet(() -> {
            User u = User.builder()
                    .email("arthur.pendelton@studentreport.com")
                    .fullName("Prof. Arthur Pendelton")
                    .phone("+1 (555) 345-8901")
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .role(User.Role.TEACHER)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(u);
        });

        Teacher teacher2 = teacherRepository.findByUserId(tUser2.getId()).orElseGet(() -> {
            Teacher t = Teacher.builder()
                    .user(tUser2)
                    .teacherId("TCH-1002")
                    .qualification("M.Sc. in Physics")
                    .specialization("Theoretical & Quantum Physics")
                    .build();
            return teacherRepository.save(t);
        });

        // Assign teacher 1 to Grade 10 A Math
        if (!assignmentRepository.existsByTeacherUserEmailAndSchoolClassIdAndSectionIdAndSubjectId(tUser1.getEmail(), class10.getId(), sec10A.getId(), math.getId())) {
            TeacherAssignment ta = TeacherAssignment.builder()
                    .teacher(teacher1)
                    .schoolClass(class10)
                    .section(sec10A)
                    .subject(math)
                    .academicYear(year2026)
                    .semester(fallSem)
                    .build();
            assignmentRepository.save(ta);
        }

        // Assign teacher 2 to Grade 10 A Physics
        if (!assignmentRepository.existsByTeacherUserEmailAndSchoolClassIdAndSectionIdAndSubjectId(tUser2.getEmail(), class10.getId(), sec10A.getId(), physics.getId())) {
            TeacherAssignment ta = TeacherAssignment.builder()
                    .teacher(teacher2)
                    .schoolClass(class10)
                    .section(sec10A)
                    .subject(physics)
                    .academicYear(year2026)
                    .semester(fallSem)
                    .build();
            assignmentRepository.save(ta);
        }

        // 5. Parent
        User pUser = userRepository.findByEmail("robert.miller@studentreport.com").orElseGet(() -> {
            User u = User.builder()
                    .email("robert.miller@studentreport.com")
                    .fullName("Robert Miller")
                    .phone("+1 (555) 765-4321")
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .role(User.Role.PARENT)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(u);
        });

        Parent parent = parentRepository.findByUserId(pUser.getId()).orElseGet(() -> {
            Parent p = Parent.builder()
                    .user(pUser)
                    .occupation("Senior Systems Architect")
                    .address("142 Elm Street, Cambridge, MA")
                    .build();
            return parentRepository.save(p);
        });

        // 6. Students
        Student s1 = createDemoStudent("Sophia Miller", "sophia.miller@studentreport.com", "STD-2026-001", "101",
                class10, sec10A, year2026, Student.Gender.FEMALE, parent, "FATHER");
        Student s2 = createDemoStudent("Lucas Davies", "lucas.davies@studentreport.com", "STD-2026-002", "102",
                class10, sec10A, year2026, Student.Gender.MALE, null, null);
        Student s3 = createDemoStudent("Emma Watson", "emma.watson@studentreport.com", "STD-2026-003", "103",
                class10, sec10A, year2026, Student.Gender.FEMALE, null, null);
        Student s4 = createDemoStudent("Noah Garcia", "noah.garcia@studentreport.com", "STD-2026-004", "104",
                class10, sec10A, year2026, Student.Gender.MALE, null, null);

        // 7. Examination & Assessments
        Examination midExam = examinationRepository.findAll().stream()
                .filter(e -> e.getName().equals("Midterm Examinations Fall 2026")).findFirst().orElseGet(() -> {
                    Examination e = Examination.builder()
                            .name("Midterm Examinations Fall 2026")
                            .examType(Examination.ExamType.MIDTERM)
                            .academicYear(year2026)
                            .semester(fallSem)
                            .startDate(LocalDate.of(2026, 10, 10))
                            .endDate(LocalDate.of(2026, 10, 20))
                            .status(Examination.ExamStatus.COMPLETED)
                            .description("Comprehensive Midterm Evaluations")
                            .build();
                    return examinationRepository.save(e);
                });

        Assessment mathMid = assessmentRepository.findByExaminationIdAndSchoolClassIdAndSectionIdAndSubjectIdAndName(
                midExam.getId(), class10.getId(), sec10A.getId(), math.getId(), "Midterm Exam - Mathematics").orElseGet(() -> {
            Assessment a = Assessment.builder()
                    .examination(midExam)
                    .schoolClass(class10)
                    .section(sec10A)
                    .subject(math)
                    .name("Midterm Exam - Mathematics")
                    .maxMarks(BigDecimal.valueOf(100.0))
                    .passingMarks(BigDecimal.valueOf(40.0))
                    .assessmentDate(LocalDate.of(2026, 10, 12))
                    .build();
            return assessmentRepository.save(a);
        });

        Assessment physMid = assessmentRepository.findByExaminationIdAndSchoolClassIdAndSectionIdAndSubjectIdAndName(
                midExam.getId(), class10.getId(), sec10A.getId(), physics.getId(), "Midterm Exam - Physics").orElseGet(() -> {
            Assessment a = Assessment.builder()
                    .examination(midExam)
                    .schoolClass(class10)
                    .section(sec10A)
                    .subject(physics)
                    .name("Midterm Exam - Physics")
                    .maxMarks(BigDecimal.valueOf(100.0))
                    .passingMarks(BigDecimal.valueOf(40.0))
                    .assessmentDate(LocalDate.of(2026, 10, 15))
                    .build();
            return assessmentRepository.save(a);
        });

        // 8. Assessment Marks
        seedMark(mathMid, s1, BigDecimal.valueOf(94.5), "Outstanding mastery of calculus concepts", tUser1);
        seedMark(physMid, s1, BigDecimal.valueOf(91.0), "Excellent analytical problem solving", tUser2);

        seedMark(mathMid, s2, BigDecimal.valueOf(82.0), "Solid performance", tUser1);
        seedMark(physMid, s2, BigDecimal.valueOf(76.5), "Good work, can improve on lab writeups", tUser2);

        seedMark(mathMid, s3, BigDecimal.valueOf(88.0), "Very good comprehension", tUser1);
        seedMark(physMid, s3, BigDecimal.valueOf(84.0), "Well structured solutions", tUser2);

        seedMark(mathMid, s4, BigDecimal.valueOf(68.5), "Review quadratic formulas", tUser1);
        seedMark(physMid, s4, BigDecimal.valueOf(62.0), "Additional practice recommended", tUser2);

        // 9. Attendance
        LocalDate[] dates = {
                LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 2), LocalDate.of(2026, 10, 3),
                LocalDate.of(2026, 10, 6), LocalDate.of(2026, 10, 7), LocalDate.of(2026, 10, 8),
                LocalDate.of(2026, 10, 9), LocalDate.of(2026, 10, 12), LocalDate.of(2026, 10, 13)
        };
        for (LocalDate d : dates) {
            seedAttendance(s1, class10, sec10A, d, AttendanceRecord.AttendanceStatus.PRESENT, tUser1);
            seedAttendance(s2, class10, sec10A, d, AttendanceRecord.AttendanceStatus.PRESENT, tUser1);
            seedAttendance(s3, class10, sec10A, d, AttendanceRecord.AttendanceStatus.PRESENT, tUser1);
            seedAttendance(s4, class10, sec10A, d, (d.getDayOfMonth() == 6 ? AttendanceRecord.AttendanceStatus.ABSENT : AttendanceRecord.AttendanceStatus.PRESENT), tUser1);
        }

        // 10. Remarks
        if (remarkRepository.findByStudentId(s1.getId()).isEmpty()) {
            TeacherRemark tr1 = TeacherRemark.builder()
                    .student(s1)
                    .teacher(teacher1)
                    .subject(math)
                    .semester(fallSem)
                    .category(TeacherRemark.RemarkCategory.EXCELLENT)
                    .description("Sophia demonstrates remarkable intellectual curiosity and consistently scores at the top of the cohort.")
                    .isPublished(true)
                    .build();
            remarkRepository.save(tr1);

            TeacherRemark tr2 = TeacherRemark.builder()
                    .student(s1)
                    .teacher(teacher2)
                    .subject(physics)
                    .semester(fallSem)
                    .category(TeacherRemark.RemarkCategory.PARTICIPATION)
                    .description("Active contributor in laboratory experiments and collaborative group activities.")
                    .isPublished(true)
                    .build();
            remarkRepository.save(tr2);
        }

        logger.info("Academic demonstration records successfully seeded!");
    }

    private Student createDemoStudent(String name, String email, String studentId, String roll,
                                      SchoolClass clz, Section sec, AcademicYear yr, Student.Gender gender,
                                      Parent parent, String relationship) {
        User u = userRepository.findByEmail(email).orElseGet(() -> {
            User nu = User.builder()
                    .email(email)
                    .fullName(name)
                    .phone("+1 (555) 432-1000")
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .role(User.Role.STUDENT)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(nu);
        });

        Student s = studentRepository.findByUserId(u.getId()).orElseGet(() -> {
            Student ns = Student.builder()
                    .user(u)
                    .studentId(studentId)
                    .rollNumber(roll)
                    .schoolClass(clz)
                    .section(sec)
                    .academicYear(yr)
                    .dateOfBirth(LocalDate.of(2010, 4, 15))
                    .gender(gender)
                    .address("45 Harvard Ave, Cambridge, MA")
                    .status(Student.StudentStatus.ACTIVE)
                    .build();
            return studentRepository.save(ns);
        });

        if (parent != null) {
            boolean exists = parentStudentRepository.existsByParentUserEmailAndStudentId(parent.getUser().getEmail(), s.getId());
            if (!exists) {
                ParentStudent ps = ParentStudent.builder()
                        .parent(parent)
                        .student(s)
                        .relationshipType(relationship != null ? relationship : "GUARDIAN")
                        .isPrimaryContact(true)
                        .build();
                parentStudentRepository.save(ps);
            }
        }

        return s;
    }

    private void seedMark(Assessment assessment, Student student, BigDecimal obtained, String remarks, User enteredBy) {
        if (markRepository.findByAssessmentIdAndStudentId(assessment.getId(), student.getId()).isEmpty()) {
            AssessmentMark mark = AssessmentMark.builder()
                    .assessment(assessment)
                    .student(student)
                    .obtainedMarks(obtained)
                    .isAbsent(false)
                    .remarks(remarks)
                    .enteredBy(enteredBy)
                    .build();
            markRepository.save(mark);
        }
    }

    private void seedAttendance(Student student, SchoolClass clz, Section sec, LocalDate date, AttendanceRecord.AttendanceStatus status, User recordedBy) {
        if (attendanceRepository.findExistingRecord(student.getId(), clz.getId(), sec.getId(), date, null).isEmpty()) {
            AttendanceRecord rec = AttendanceRecord.builder()
                    .student(student)
                    .schoolClass(clz)
                    .section(sec)
                    .attendanceDate(date)
                    .status(status)
                    .recordedBy(recordedBy)
                    .build();
            attendanceRepository.save(rec);
        }
    }
}
