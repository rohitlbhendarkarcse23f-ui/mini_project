# Backend Setup Instructions

## Prerequisites
- Node.js installed
- MongoDB installed and running

## Installation

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB (if not running):
```bash
mongod
```

4. Start the server:
```bash
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### POST /api/auth/signup
Register a new student
- Body: `{ student_id, email, password, semester }`
- Email must end with @kdkce.edu.in
- Returns error if student_id or email already exists

### POST /api/auth/signin
Login student
- Body: `{ identifier, password }`
- identifier can be student_id or email
- Returns JWT token on success

## Security Features
- Passwords hashed with bcrypt
- Email validation (@kdkce.edu.in only)
- Unique constraints on student_id and email
- JWT authentication
- SQL injection prevention via Mongoose
