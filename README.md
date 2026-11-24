# Student Report System

An enterprise-grade academic management and performance tracking platform built with **React 19 + Vite**, **Spring Boot 3 (Java 21)**, and **Neon Cloud PostgreSQL**.

---

## Architecture & Technology Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS (Custom Olive & Sage Academy Theme)
- **State & Data Caching**: TanStack Query v5 (`@tanstack/react-query`) with automatic background refetching and zero-waterfall query resolution
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with automatic correlation ID (`X-Correlation-ID`) and 15s timeout
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Framework**: Spring Boot 3.3.5 (Java 21)
- **Security**: Spring Security 6 with JWT (HttpOnly Cookie & Bearer Token fallback)
- **Persistence**: Spring Data JPA + Hibernate 6 with optimized native SQL aggregation queries
- **Connection Pool**: HikariCP configured specifically for Neon Serverless connection pooler
- **Database Migrations**: Flyway (V1 Schema, V2 Grading/Settings, V3 Composite Performance Indexes)
- **Observability**: `PerformanceLoggingFilter` measuring request durations and setting `X-Response-Time-Ms` headers
- **Reporting & Exports**: Apache Commons CSV & OpenPDF / iText

### Database
- **Provider**: Neon Cloud Serverless PostgreSQL (PostgreSQL 18.7 on AWS US-East-2)
- **Connection Pooling**: Neon PgBouncer transaction pooler enabled
- **SSL / Security**: `sslmode=require` with SCRAM channel binding (`channel_binding=require`)
- **No Local Storage Fallback**: Zero local databases, zero browser-only data persistence; 100% cloud-persisted.

---

## Design System

Designed around a warm, scholarly, academic aesthetic:

| Role | Color Hex | Usage |
| :--- | :--- | :--- |
| **Warm Ivory** | `#F7F6EF` | Global application canvas |
| **Pure White** | `#FFFFFF` | Elevated cards, tables, panels |
| **Soft Cream** | `#F0EFE4` | Subtle backgrounds, inputs, badge fills |
| **Olive Green** | `#69744A` | Primary interactive buttons, key badges |
| **Forest Olive** | `#414B32` | Dark sidebar, active nav states, brand accent |
| **Sage Green** | `#AAB397` | Secondary accents, borders, tags |
| **Pale Sage** | `#E5E9DC` | Metric backgrounds, highlight pills |
| **Charcoal** | `#292C24` | Primary high-contrast text |
| **Muted Grey** | `#77796D` | Subtitles, helper text, table column headers |

---

## Key Performance Upgrades

1. **Dedicated Aggregation Endpoints (Zero Client Waterfall)**:
   - Admin Summary (`GET /api/dashboard/admin/summary`): Computes all institutional metrics (total students, classes, teachers, overall average performance, average attendance, top performers, and class-wise distributions) in single optimized database calls rather than 8+ sequential frontend requests.
   - Student Dashboard (`GET /api/dashboard/student`): Fetches student profile, enrolled subjects, assessment marks, attendance stats, and teacher remarks in a single scoped payload.
   - Teacher Dashboard (`GET /api/dashboard/teacher`): Returns assigned classes, subjects, student counts, and recent assessments.
   - Parent Dashboard (`GET /api/dashboard/parent`): Fetches linked children, their respective current grades, attendance, and latest teacher remarks.

2. **Server-Side Pagination & Debounced Search**:
   - Student Directory (`GET /api/students?page=0&size=20&paged=true`): Paginated queries with debounced 300ms search, preventing large database table scans across network latency.

3. **Composite Database Indexes (`V3__performance_indexes.sql`)**:
   - `idx_students_class_section_roll`: Fast class/section roster lookup.
   - `idx_marks_student_assessment`: Fast student grade calculation.
   - `idx_attendance_student_date`: Rapid attendance percentage aggregations.
   - `idx_teacher_remarks_student`: Direct student remarks resolution.
   - `idx_parent_student_parent`: Instant parent-child linking.
   - `idx_teacher_assignments_lookup`: Class allocation lookups.

4. **TanStack Query Caching & Smooth Skeleton Loaders**:
   - Configured with 20–30s stale time to eliminate redundant network round-trips when switching tabs.
   - Replaced abrupt blank spinners with matching shimmer skeleton states.

5. **Premium Split-Screen Login & Public Landing Page**:
   - Public Landing Page (`/`): Introduces the institution (Oakridge Academy), feature highlights, role portals, and architectural guarantees.
   - Redesigned Login (`/login`): Split-screen UI featuring academic branding and secure role selection. Credentials are no longer exposed on the public form.

---

## Getting Started

### 1. Database Configuration
Copy `.env.example` to `.env` (or configure system environment variables):

```bash
cp .env.example .env
```

Your Neon PostgreSQL credentials:
```env
DATABASE_URL=jdbc:postgresql://ep-gentle-heart-bdaousjp-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_DIRECT_URL=jdbc:postgresql://ep-gentle-heart-bdaousjp.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=npg_k4rEIjOctv2l
JWT_SECRET=student_report_system_super_secret_jwt_key_that_is_long_enough_2026
```

### 2. Run the Backend
```bash
cd backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.

---

## Health Checks & Diagnostics

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health/live` | `GET` | Instant liveness check (`UP`) |
| `/api/health/ready` | `GET` | Readiness check (executes `SELECT 1` ping to Neon and returns latency) |

---

## Development Test Accounts

For testing, auditing, and role verification in development environments:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@studentreport.com` | `Password@123` |
| **Teacher** | `eleanor.vance@studentreport.com` | `Password@123` |
| **Student** | `sophia.miller@studentreport.com` | `Password@123` |
| **Parent** | `robert.miller@studentreport.com` | `Password@123` |

---

## License & Academic Disclaimer
Developed for the Student Report System institutional platform. All rights reserved.
