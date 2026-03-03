

## Authentication

- **Login** sets an **HttpOnly cookie** (session/token). The frontend does not read the cookie; it is sent automatically with subsequent requests.
- **Auth-required endpoints** must return **401 Unauthorized** when the session is invalid or missing. The frontend will then redirect to login or show an error.
- **Logout** must clear the session cookie.

---

## Auth Endpoints

### 1. POST `/auth/login`

Authenticate the user and establish a session.

| Item | Description |
|------|-------------|
| **Request Body** | JSON |
| **Response** | JSON |

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**

```json
{
  "userId": 1,
  "role": "Admin"
}
```

- **`role`** must be one of: `"Admin"` \| `"Teacher"` \| `"Student"`.
- Backend must set the **HttpOnly** session cookie on success.

**Error:** Return an appropriate HTTP status (e.g. 401) for invalid credentials. The frontend treats non-2xx as login failure.

---

### 2. GET `/auth/me`

Return the currently authenticated user. Used on app load and after login.

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Headers** | Cookie (session) |
| **Response** | JSON |

**Success Response (200):**

```json
{
  "userId": 1,
  "role": "Student"
}
```

**Error:** Return **401** if not authenticated. The frontend will treat the user as logged out.

---

### 3. POST `/auth/logout`

Invalidate the current session.

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Headers** | Cookie (session) |

**Success Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

- Backend must **clear the HttpOnly** session cookie.

---

## Student Role Endpoints

All endpoints below require an authenticated user with **role: Student**. Use the same session cookie as above.

---

### 4. GET `/student/cards`

Returns the list of dashboard cards (e.g. Quarter Grades, Final Grades, Competencies) for the student dashboard.

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Response** | Array of card objects (or wrapper) |

**Success Response (200):**

The frontend accepts any of these shapes:

- Raw array: `[{ "id": 1, "title": "...", ... }, ...]`
- Wrapped: `{ "cards": [...] }` or `{ "data": [...] }`

**Example (raw array):**

```json
[
  {
    "id": 1,
    "title": "Quarter Grades",
    "description": "View your quarterly performance across all subjects.",
    "route": "/student/quarter"
  },
  {
    "id": 2,
    "title": "Final Grades",
    "description": "View your semester final exam grades.",
    "route": "/student/final"
  },
  {
    "id": 3,
    "title": "Competencies Grades",
    "description": "View your specialization competency grades.",
    "route": "/student/jadarat"
  }
]
```

If the endpoint fails or is not implemented, the frontend uses a static fallback and still renders the dashboard.

---

### 5. GET `/student/profile`

Returns the current student’s profile for the dashboard header (name, year label, subtitle).

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Response** | JSON object |

**Success Response (200):**

```json
{
  "name": "Ahmed",
  "year": "Year 2",
  "subtitle": "Your academic overview",
  "currentAcademicYear": "senior"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `year` | string | No | Year label (e.g. "Year 2") |
| `subtitle` | string | No | Subtitle under the header |
| `currentAcademicYear` | string | No | One of `"junior"` \| `"senior"` \| `"wheeler"`. Used as the default academic year until the student picks one on the Years page. |

If the endpoint fails, the frontend uses default values (e.g. name `"Student"`, empty year).

---

### 6. GET `/student/years`

Returns the list of academic years available for selection (e.g. Junior, Wheeler, Senior).

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Response** | Array of year options (or wrapper) |

**Success Response (200):**

The frontend accepts:

- Raw array: `[{ "id": "junior", "number": "1", "title": "Junior" }, ...]`
- Wrapped: `{ "years": [...] }` or `{ "data": [...] }`

**Example (raw array):**

```json
[
  { "id": "junior", "number": "1", "title": "Junior" },
  { "id": "wheeler", "number": "2", "title": "Wheeler" },
  { "id": "senior", "number": "3", "title": "Senior" }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Must be `"junior"` \| `"senior"` \| `"wheeler"` (used as query param for grades). |
| `number` | string | Display number (e.g. "1", "2"). |
| `title` | string | Display label (e.g. "Junior"). |

If the endpoint fails, the frontend uses a static list.

---

### 7. GET `/student/grades/quarter?year={year}`

Returns quarter grades for the given academic year.

| Item | Description |
|------|-------------|
| **Query** | `year` (required): `junior` \| `senior` \| `wheeler` |
| **Response** | JSON with `grades` array |

**Success Response (200):**

```json
{
  "grades": [
    { "subject": "Mathematics", "yourGrade": 25, "quarterGrade": 25 },
    { "subject": "Physics", "yourGrade": 20, "quarterGrade": 22 }
  ],
  "year": "senior"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `grades` | array | List of grade rows (see below). |
| `year` | string | Echo of the requested year (optional). |

**Grade row:**

| Field | Type | Description |
|-------|------|-------------|
| `subject` | string | Subject name |
| `yourGrade` | number | Student’s grade (e.g. out of 25) |
| `quarterGrade` | number | Quarter grade value |

**Note:** The frontend **calculates the average** from `grades` (average of `yourGrade`). You do not need to send `averageGrade`; if sent, it is ignored.

---

### 8. GET `/student/grades/final?year={year}`

Returns final exam grades for the given academic year. Same contract as **Quarter grades** above.

| Item | Description |
|------|-------------|
| **Query** | `year` (required): `junior` \| `senior` \| `wheeler` |
| **Response** | Same shape as quarter: `{ "grades": [...], "year": "..." }` |

**Grade row:** Same as quarter: `subject`, `yourGrade`, `quarterGrade`.  
Average is computed on the frontend from `yourGrade`.

---

### 9. GET `/student/grades/jadarat?year={year}`

Returns competencies (Jadarat) grades for the given academic year.

| Item | Description |
|------|-------------|
| **Query** | `year` (required): `junior` \| `senior` \| `wheeler` |
| **Response** | JSON with `grades` array |

**Success Response (200):**

```json
{
  "grades": [
    { "Jadarat": "API", "Your_Attemps": "Fail", "Attemps": "Attemp-one" },
    { "Jadarat": "Multi-media", "Your_Attemps": "Pass", "Attemps": "Attemp-two" }
  ],
  "year": "senior"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `Jadarat` | string | Competency / subject name |
| `Your_Attemps` | string | `"Pass"` or `"Fail"` (case-insensitive on frontend) |
| `Attemps` | string | Attempt label (e.g. "Attemp-one") |

**Note:** The frontend **calculates the pass rate** (percentage of `"Pass"`) from `grades`. You do not need to send `averageGrade`.

---

## Data Types (TypeScript)

Reference types used by the frontend (for implementation or codegen):

```ts
// Auth
interface LoginPayload {
  username: string;
  password: string;
}

interface AuthUser {
  userId: number;
  role: "Admin" | "Teacher" | "Student";
}

// Student cards
interface StudentCardApi {
  id: number;
  title: string;
  description: string;
  route: string;
}

// Student profile
interface StudentProfileResponse {
  name: string;
  year?: string;
  subtitle?: string;
  currentAcademicYear?: "junior" | "senior" | "wheeler";
}

// Years list
interface YearOption {
  id: "junior" | "senior" | "wheeler";
  number: string;
  title: string;
}

// Quarter / Final grades
interface QuarterGradeRow {
  subject: string;
  yourGrade: number;
  quarterGrade: number;
}

// Jadarat grades
interface JadaratGradeRow {
  Jadarat: string;
  Your_Attemps: string;
  Attemps: string;
}

// Teacher subjects
interface TeacherSubject {
  id: number;
  title: string;
  subjectName: string;
  year: "junior" | "wheeler" | "senior";
  route?: string;
}

// Teacher profile
interface TeacherProfileResponse {
  name: string;
  subtitle?: string;
  currentAcademicYear?: "junior" | "wheeler" | "senior";
}

// Teacher classes
interface TeacherClassesResponse {
  classes: TeacherClass[];
  year: string;
  subjectName: string;
}

interface TeacherClass {
  id: number | string;
  className: string;
  studentCount?: number;
  lastModified?: string;
}
```

---

## Teacher Role Endpoints

All endpoints below require an authenticated user with **role: Teacher**. Use the same session cookie as above.

---

### 10. GET `/teacher/profile`

Returns the current teacher's profile for the dashboard header (name, subtitle, currentAcademicYear).

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Response** | JSON object |

**Success Response (200):**

```json
{
  "name": "Ahmed Karim",
  "subtitle": "Mathematics Teacher",
  "currentAcademicYear": "senior"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Teacher's display name |
| `subtitle` | string | No | Teacher's subject or title |
| `currentAcademicYear` | string | No | One of `"junior"` \| `"wheeler"` \| `"senior"`. Default academic year for filtering. |

---

### 11. GET `/teacher/subjects`

Returns the list of subjects taught by the teacher, grouped by academic year.

| Item | Description |
|------|-------------|
| **Request Body** | None |
| **Response** | Array of subject objects (or wrapper) |

**Success Response (200):**

The frontend accepts:

- Raw array: `[{ "id": 1, "title": "Senior", "subjectName": "Mathematics", "year": "senior", ... }, ...]`
- Wrapped: `{ "subjects": [...] }` or `{ "data": [...] }`

**Example (raw array):**

```json
[
  {
    "id": 1,
    "title": "Junior",
    "subjectName": "Mathematics",
    "year": "junior",
    "route": "/teacher/classes"
  },
  {
    "id": 2,
    "title": "Wheeler",
    "subjectName": "Physics",
    "year": "wheeler",
    "route": "/teacher/classes"
  },
  {
    "id": 3,
    "title": "Senior",
    "subjectName": "Chemistry",
    "year": "senior",
    "route": "/teacher/classes"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique subject ID |
| `title` | string | Academic year title (e.g. "Junior", "Wheeler", "Senior") |
| `subjectName` | string | Name of the subject being taught |
| `year` | string | Academic year identifier: `"junior"` \| `"wheeler"` \| `"senior"` |
| `route` | string | Navigation route (optional) |

---

### 12. GET `/teacher/classes?year={year}&subject={subject}`

Returns the list of classes for a given academic year and subject.

In the current front-end workspace this endpoint is implemented as a **mock Next.js API route** under `src/pages/api/teacher/classes.ts`. It uses the same mock data defined in `src/data/Teacher/teacherMockData.ts` so the UI works offline. When a real backend becomes available, simply remove or override the mock route and the service will continue to function without modification.

| Item | Description |
|------|-------------|
| **Query** | `year` (required): `junior` \| `wheeler` \| `senior` |
| | `subject` (optional): Subject ID or name for filtering (ignored by mock) |
| **Response** | JSON with `classes` array |

**Success Response (200):**

```json
{
  "classes": [
    { "id": 1, "className": "A1", "studentCount": 25, "lastModified": "2024-01-15" },
    { "id": 2, "className": "A2", "studentCount": 28, "lastModified": "2024-01-14" }
  ],
  "year": "senior",
  "subjectName": "Mathematics"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `classes` | array | List of class objects |
| `year` | string | Echoed academic year |
| `subjectName` | string | Name of the subject for these classes |

**Class row:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | number \| string | Unique class ID |
| `className` | string | Class name or identifier (e.g. "A1", "B2") |
| `studentCount` | number | Optional: number of students in the class |
| `lastModified` | string | Optional: last modification date |

If the endpoint fails, the frontend shows an error message with an option to retry.

---

### 13. GET `/teacher/students?classId={classId}`

Returns the list of students in a given class, with their grades and pass/fail status.

| Item | Description |
|------|-------------|
| **Query** | `classId` (required): Unique class identifier |
| **Response** | JSON with `students` array |

**Success Response (200):**

```json
{
  "students": [
    {
      "id": 1,
      "name": "Ali Ahmed",
      "quarterGrade": 18,
      "teacherGrade": null,
      "finalGrade": 20,
      "status": "pass"
    },
    {
      "id": 2,
      "name": "Sara Mohammed",
      "quarterGrade": 22,
      "teacherGrade": null,
      "finalGrade": 20,
      "status": "pass"
    },
    {
      "id": 3,
      "name": "Omar Hassan",
      "quarterGrade": 15,
      "teacherGrade": null,
      "finalGrade": 20,
      "status": "fail"
    }
  ],
  "classId": 1,
  "className": "A1"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `students` | array | List of student objects (see below) |
| `classId` | string \| number | Echo of requested class ID |
| `className` | string | Optional: class name (e.g. "A1") |

**Student row:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number \| string | Yes | Unique student ID |
| `name` | string | Yes | Student's full name |
| `quarterGrade` | number | No | Quarter grade from previous assessment |
| `teacherGrade` | number | No | Teacher's grade input (null if not yet submitted) |
| `finalGrade` | number | No | Final grade set by admin (passing threshold) |
| `status` | string | No | `"pass"` or `"fail"` based on comparison of `teacherGrade` vs `finalGrade` |

**Notes:**
- The frontend uses `status` field to show pass/fail chips in the grading table.
- Pass/fail statistics are calculated from the `status` field.
- If `finalGrade` is not provided, pass/fail determination should be based on `teacherGrade` >= department threshold.

---

### 14. POST `/teacher/grades`

Submit or update a student's grade for a class.

| Item | Description |
|------|-------------|
| **Request Body** | JSON |
| **Response** | JSON confirmation |

**Request Body:**

```json
{
  "classId": 1,
  "studentId": 3,
  "grade": 22
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `classId` | number \| string | Yes | Class identifier |
| `studentId` | number \| string | Yes | Student identifier |
| `grade` | number | Yes | Grade value (e.g. 0-25) |

**Success Response (200 or 201):**

```json
{
  "success": true,
  "message": "Grade saved successfully",
  "data": {
    "classId": 1,
    "studentId": 3,
    "grade": 22
  }
}
```

Or minimal response:

```json
{
  "ok": true
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Invalid grade value"
}
```

**Notes:**
- Backend should validate grade is a valid number (typically 0-25 or 0-100 depending on system).
- Backend should update student record and recalculate `status` (pass/fail) if `finalGrade` threshold is available.
- Frontend does not rely on response body; accepts any 2xx status as success.
- Endpoint should be protected (require `role: Teacher`).

---

## Summary

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | POST | `/auth/login` | Login, set session cookie |
| 2 | GET | `/auth/me` | Current user (userId, role) |
| 3 | POST | `/auth/logout` | Logout, clear cookie |
| 4 | GET | `/student/cards` | Dashboard cards for student |
| 5 | GET | `/student/profile` | Student name, year, subtitle, currentAcademicYear |
| 6 | GET | `/student/years` | Academic years list (junior/senior/wheeler) |
| 7 | GET | `/student/grades/quarter?year=` | Quarter grades for year |
| 8 | GET | `/student/grades/final?year=` | Final grades for year |
| 9 | GET | `/student/grades/jadarat?year=` | Jadarat (competencies) grades for year |
| 10 | GET | `/teacher/profile` | Teacher name, subtitle, currentAcademicYear |
| 11 | GET | `/teacher/subjects` | List of subjects taught by teacher (grouped by year) |
| 12 | GET | `/teacher/classes?year=&subject=` | Classes for a subject in a year |
| 13 | GET | `/teacher/students?classId=` | Students within a class (shows name and quarter grade) |
| 14 | POST | `/teacher/grades` | Submit a grade for a student (body: classId, studentId, grade) |

---

