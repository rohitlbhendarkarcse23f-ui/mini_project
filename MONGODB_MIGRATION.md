# Firebase to MongoDB Migration Summary

## Overview
Successfully migrated Campus Connect from Firebase to MongoDB (localhost:27017).

## Changes Made

### Backend (server/)

1. **server.js**
   - Removed Firebase Admin SDK
   - Added mongoose connection to `mongodb://localhost:27017/campus_db`
   - Mounted routes: `/api/auth`, `/api/recruiter`, `/api/db`

2. **Models Added**
   - `models/Student.js` - Student authentication model
   - `models/Recruiter.js` - Recruiter authentication model

3. **Routes Added**
   - `routes/auth.js` - Student signup/signin with JWT
   - `routes/recruiter.js` - Recruiter signup/signin with JWT
   - `routes/db.js` - Generic CRUD for any collection (replaces Firestore)

4. **package.json**
   - Removed: `firebase-admin`
   - Added: `mongoose`, `bcrypt`, `jsonwebtoken`

### Frontend (src/)

1. **API Layer (src/api/)** - Replaces src/firebase/
   - `api/config.js` - Base API URL (http://localhost:5000/api)
   - `api/auth.js` - Student authentication via REST API
   - `api/db.js` - Generic CRUD operations via REST API

2. **Components Updated**
   - `Login.jsx` - Uses MongoDB API, removed Google sign-in
   - `StudentSignup.jsx` - Uses MongoDB API
   - `RecruiterSignup.jsx` - Uses MongoDB API (was localStorage)
   - `RecruiterLogin.jsx` - Uses MongoDB API (was localStorage)

## API Endpoints

### Student Auth
- `POST /api/auth/signup` - Register student
  - Body: `{ student_id, email, password }`
- `POST /api/auth/signin` - Login student
  - Body: `{ identifier, password }`
  - Returns: `{ token, student_id }`

### Recruiter Auth
- `POST /api/recruiter/signup` - Register recruiter
  - Body: `{ company, email, phone, website, industry, role, password }`
  - Returns: `{ token, recruiter }`
- `POST /api/recruiter/signin` - Login recruiter
  - Body: `{ email, password }`
  - Returns: `{ token, recruiter }`

### Generic DB Operations (requires JWT token in Authorization header)
- `GET /api/db/:collection` - Get all documents
- `GET /api/db/:collection/:id` - Get one document
- `PUT /api/db/:collection/:id` - Create/replace document
- `PATCH /api/db/:collection/:id` - Update document
- `DELETE /api/db/:collection/:id` - Delete document

## Environment Variables

### server/.env
```
MONGODB_URI=mongodb://localhost:27017/campus_db
JWT_SECRET=your_jwt_secret_key_change_this
PORT=5000
```

## Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   npm install
   npm run dev
   ```

## Key Differences

| Feature | Firebase | MongoDB |
|---------|----------|---------|
| Auth | Firebase Auth | JWT tokens |
| Database | Firestore/Realtime DB | MongoDB collections |
| Storage | Firebase Storage | Not yet migrated |
| Google Sign-in | Supported | Removed |
| Offline | Built-in | Manual implementation needed |

## Notes

- JWT tokens stored in localStorage
- Teacher login still uses hardcoded credentials (teacher@kdkce.edu.in / teacher123)
- File uploads (resumes, certificates) still need migration from Firebase Storage
- All student/recruiter data now persists in MongoDB instead of localStorage/Firebase
