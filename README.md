# Campus Connect

A full-stack campus management platform that connects **students**, **teachers**, and **recruiters** in one unified ecosystem — built for KDK College of Engineering.

---

## Overview

Campus Connect digitizes and streamlines campus operations by giving each user role a dedicated portal:

- **Students** manage their academic profile, upload marksheets, apply for jobs/internships, join clubs, and track CGPA progress.
- **Teachers** manage events, clubs, view merit lists, and parse student marksheets using AI-powered OCR.
- **Recruiters** post jobs and internships, search candidates by skills/CGPA/department, and manage applications.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router DOM 7, Vite 7 |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| File Storage | Multer (local `server/uploads/`) |
| PDF Generation | jsPDF 4 |
| AI OCR | Docling (Python FastAPI microservice on port 5001) |
| Real-time | Server-Sent Events (SSE) for notifications, 3s polling for messages |

---

## Project Structure

```
campus-connect/
├── src/                          # React frontend
│   ├── api/
│   │   ├── auth.js               # Login / signup API calls
│   │   ├── config.js             # API base URL
│   │   └── profiles.js           # Student / teacher / recruiter profile APIs
│   ├── components/
│   │   ├── Student/
│   │   │   ├── StudentDashboard.jsx   # Main student portal
│   │   │   ├── StudentSignup.jsx
│   │   │   ├── MarksheetUpload.jsx    # Manual marksheet entry
│   │   │   └── AIMarksheetUpload.jsx  # AI/OCR marksheet extraction
│   │   ├── Teacher/
│   │   │   ├── TeacherDashboard.jsx   # Main teacher portal
│   │   │   ├── TeacherSignup.jsx
│   │   │   ├── MeritList.jsx          # Real-time merit ranking
│   │   │   └── TeacherMarksheetParser.jsx
│   │   ├── Recruiter/
│   │   │   ├── RecruiterDashboard.jsx # Main recruiter portal
│   │   │   ├── RecruiterSignup.jsx
│   │   │   └── RecruiterLogin.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Toast.jsx              # Global toast notifications
│   │   └── PasswordInput.jsx
│   ├── utils/
│   │   ├── aiMarksheetExtractor.js  # Docling API client
│   │   ├── meritSort.js             # SHA-256 deterministic merit ranking
│   │   ├── jobsStore.js
│   │   ├── eventsStore.js
│   │   └── clubsStore.js
│   ├── App.jsx                    # Routes + page title management
│   └── main.jsx
│
├── server/                        # Express backend
│   ├── models/
│   │   ├── Student.js / StudentProfile.js
│   │   ├── Teacher.js / TeacherProfile.js
│   │   ├── Recruiter.js / RecruiterProfile.js
│   │   ├── Job.js
│   │   ├── Event.js
│   │   ├── Club.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/signin|signup
│   │   ├── student.js       # CRUD + CGPA auto-calc
│   │   ├── teacher.js       # Teacher profile + marksheet access
│   │   ├── recruiter.js     # Company profile + team
│   │   ├── jobs.js          # Job/internship CRUD + applications
│   │   ├── events.js        # Event CRUD + registrations
│   │   ├── clubs.js         # Club CRUD
│   │   ├── messages.js      # Chat rooms + SSE stream
│   │   ├── marksheet.js     # Proxy to Docling OCR service
│   │   ├── upload.js        # Multer file uploads
│   │   ├── db.js            # Generic document store
│   │   └── middleware.js    # JWT auth middleware
│   ├── uploads/             # Uploaded files (marksheets, certs, etc.)
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── docling_service/           # Python AI microservice
│   ├── main.py               # FastAPI + Docling OCR parser
│   └── requirements.txt
│
├── .env                       # Frontend env vars
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## Features

### Student Portal
| Feature | Details |
|---------|---------|
| Profile Management | Name, department, year, semester, bio, address |
| Skills | Dropdown of 35+ skills + custom entry, proficiency slider |
| Experience | Add internships/jobs with file upload (offer letter) |
| Certificates | Add certs with file upload or credential URL |
| Resume Upload | PDF, max 2MB |
| Marksheet — Manual | Subject-wise grade entry, live SGPA calculation |
| Marksheet — AI OCR | Upload PDF/image → Docling extracts subjects & grades automatically |
| CGPA Auto-Calculation | Recalculated server-side from all semester SGPAs on every save |
| SGPA Trend Chart | SVG line chart on dashboard showing semester-wise SGPA progression |
| Job / Internship Apply | Browse and apply; application status tracked |
| Events | Register for campus events |
| Clubs | Join clubs with membership payment flow + PDF receipt |
| Payments | View fee dues, pay via UPI, download jsPDF receipt |
| ID Card | Preview + download PNG student ID card (Canvas-rendered) |
| Profile PDF | Download full profile as formatted A4 PDF |
| Messages | Real-time group chat (3s polling, MongoDB-backed) |
| Notifications | SSE-based bell showing new events and jobs instantly |
| Dark / Light Theme | Persisted per user |

### Teacher Portal
| Feature | Details |
|---------|---------|
| Dashboard | Stats: jobs, internships, clubs, events |
| Merit List | Real API data, 6 tie-breaking strategies, SHA-256 final tie-breaker, CSV + PDF export |
| Marksheet Parser | View and parse student-uploaded marksheets |
| Events | Create, remove, download registration CSV |
| Clubs | Add, remove, download member CSV |
| Profile | Edit designation, qualification, subjects, bio |

### Recruiter Portal
| Feature | Details |
|---------|---------|
| Job Postings | Create/remove jobs with CGPA filter, eligible branches, deadline |
| Internships | Create/remove internships |
| Applicants | View all applicants sorted by match score, update status (shortlist/interview/hire/reject), export CSV |
| Find Candidates | Advanced search: department dropdown, skill dropdown, CGPA range, year, semester filters + candidate detail modal |
| Company Profile | Edit company info, description, industry; share company code with team |
| Team Members | View all recruiters under same company |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Student signup |
| POST | `/api/auth/signin` | Student / teacher login |
| POST | `/api/teachers/signup` | Teacher signup |
| POST | `/api/teachers/signin` | Teacher login |
| POST | `/api/recruiter/signup` | Recruiter signup |
| POST | `/api/recruiter/signin` | Recruiter login |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | All students (teacher/merit list) |
| GET | `/api/students/:id` | Get student profile |
| PUT | `/api/students/:id` | Update profile (auto-recalculates CGPA) |
| PUT | `/api/students/:id/skills` | Update skills |
| PUT | `/api/students/:id/experiences` | Update experiences |
| PUT | `/api/students/:id/certificates` | Update certificates |
| PUT | `/api/students/:id/marksheets` | Update marksheets (auto-recalculates CGPA + sgpaList) |

### Jobs & Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | All jobs/internships |
| POST | `/api/jobs` | Create job/internship |
| DELETE | `/api/jobs/:id` | Remove job |
| POST | `/api/jobs/:id/apply` | Apply for job |
| GET | `/api/jobs/applicants/:company_id` | Get applicants for company |

### Events & Clubs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/events` | List / create events |
| POST | `/api/events/:id/register` | Register for event |
| GET/POST/DELETE | `/api/clubs` | List / create / delete clubs |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/rooms` | List chat rooms |
| GET | `/api/messages/:room_id` | Get messages (supports `?since=<iso>`) |
| POST | `/api/messages/:room_id` | Send message |
| GET | `/api/messages/stream` | SSE stream for real-time notifications |

### File Upload & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/:type` | Upload file (type: certificate/experience/marksheet/resume) |
| POST | `/api/marksheet` | Proxy to Docling OCR — returns extracted subjects + SGPA |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Python 3.10+ (only if using AI marksheet extraction)

### 1. Clone & Install

```bash
git clone <repository-url>
cd campus-connect

# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Configure Environment

Create `.env` in the root directory:
```env
VITE_API_BASE=http://localhost:5000/api
```

Create `.env` in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_db
JWT_SECRET=your_jwt_secret_here
DOCLING_URL=http://localhost:5001
```

### 3. Start the Servers

**Terminal 1 — Frontend:**
```bash
npm run dev
# http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
cd server
npm run dev
# http://localhost:5000
```

**Terminal 3 — AI OCR (optional):**
```bash
cd server/docling_service
pip install -r requirements.txt
python main.py
# http://localhost:5001
```

---

## AI Marksheet Extraction

The Docling microservice (`server/docling_service/main.py`) accepts a PDF or image of a marksheet and returns:

```json
{
  "success": true,
  "data": {
    "studentId": "KF23CS164",
    "studentName": "Rahul Sharma",
    "semester": 3,
    "branch": "Computer Science",
    "subjects": [
      { "code": "CS301", "name": "Data Structures", "credits": 4, "grade": "A+", "gradePoints": 9 }
    ],
    "sgpa": 8.75,
    "totalCredits": 22
  },
  "confidence": 85,
  "method": "docling"
}
```

The frontend allows reviewing and correcting extracted data before saving. If the service is unavailable, students can use Manual Entry instead.

---

## Merit Ranking Algorithm

Located in `src/utils/meritSort.js`. Ranking is deterministic with 4 levels of tie-breaking:

1. **CGPA** — overall average of all semester SGPAs
2. **Current SGPA** — latest (or filtered) semester SGPA
3. **Chosen strategy** (configurable):
   - Improvement Trend
   - Total Credits Earned
   - Best Subject Grade
   - Fewest Failures
   - Credits-Weighted SGPA
   - Academic Consistency (lowest variance)
4. **SHA-256 micro-precision** — deterministic final tie-breaker based on student ID + SGPA list

---

## Scripts

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

### Backend
```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Production start
```

---

## Security

- JWT tokens for all protected API routes
- bcrypt password hashing
- Multer file type + size validation (PDF/images only, max 5MB)
- Protected React routes — redirect to login if unauthenticated
- Environment variables for all secrets (never committed)

---

## Deployment

The frontend builds to `dist/` via Vite and can be deployed to any static host (Vercel, Netlify, etc.).

The backend is a standard Express app deployable to Railway, Render, or any Node.js host.

```bash
# Build frontend
npm run build

# Start backend in production
cd server && npm start
```

Set `VITE_API_BASE` to your production backend URL before building.

---

## License

Private and proprietary — KDK College of Engineering.
