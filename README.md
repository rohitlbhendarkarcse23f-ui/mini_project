# Campus Connect

A comprehensive campus management platform connecting students, teachers, and recruiters in one unified ecosystem.

## 📋 Overview

Campus Connect is a modern full-stack web application designed to transform campus management by creating a unified digital ecosystem that connects students, teachers, and recruiters. It addresses the limitations of traditional systems that operate in silos, making it difficult for students to showcase skills, teachers to track progress, and recruiters to identify talent efficiently.

The platform offers students a dynamic digital portfolio to highlight achievements, explore opportunities, and engage in campus activities. Teachers gain access to tools for monitoring academic performance, managing events, and overseeing extracurricular development. Recruiters benefit from a streamlined hiring process with direct access to a curated talent pool and advanced filtering features.

Campus Connect is built with React to create a fast and responsive user interface, while Node.js and Express.js power a strong and scalable backend. Firebase is used to store and manage data efficiently.

The platform focuses heavily on security by using Firebase Authentication to protect user access, secure password encryption, and strict input validation to prevent errors and attacks. Together, these technologies ensure the application runs smoothly, stays secure, and provides a reliable and user-friendly experience.

## ✨ Features

### 👨‍🎓 Student Portal
- **Profile Management**: Create and manage comprehensive student profiles
- **Skills Showcase**: Add and display technical skills with proficiency levels
- **Experience Tracking**: Document internships and work experiences
- **Certificate Management**: Upload and manage academic certificates
- **Resume Upload**: Upload and store resumes (PDF, max 2MB)
- **Marksheet Management**: Manual entry of semester-wise grades with auto SGPA calculation
- **Job Applications**: Browse and apply for job opportunities
- **Events & Clubs**: Participate in campus events and join clubs
- **Profile Download**: Export profile as PDF
- **Academic Dashboard**: View SGPA, semester info, and academic progress

### 👨‍🏫 Teacher Portal
- **Student Management**: View and manage student profiles
- **Academic Tracking**: Monitor student progress and performance
- **Event Management**: Create and manage campus events
- **Club Administration**: Oversee student clubs and activities

### 🏢 Recruiter Portal
- **Job Posting**: Create and manage job listings
- **Candidate Search**: Browse student profiles and filter by skills
- **Application Management**: Review and manage job applications
- **Company Profile**: Maintain recruiter/company information

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **React Router DOM 7.13.0** - Client-side routing
- **Vite 7.3.1** - Build tool and dev server
- **jsPDF 4.2.0** - PDF generation
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **Firebase Admin 12.0.0** - Backend SDK for Firebase services
- **Firebase** - Cloud database and services
  - **Firestore** - NoSQL cloud database
  - **Realtime Database** - Real-time data synchronization
  - **Firebase Storage** - Cloud file storage
  - **Firebase Authentication** - User authentication
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.3.1** - Environment variables

## 📁 Project Structure

```
my-Project/
├── src/
│   ├── components/
│   │   ├── Student/          # Student dashboard & features
│   │   ├── Teacher/          # Teacher dashboard & features
│   │   ├── Recruiter/        # Recruiter dashboard & features
│   │   ├── Home.jsx          # Landing page
│   │   └── Login.jsx         # Authentication
│   ├── firebase/             # Firebase configuration
│   │   ├── config.js         # Firebase client config
│   │   ├── auth.js           # Authentication helpers
│   │   └── firestore.js      # Firestore helpers
│   ├── utils/                # State management stores
│   │   ├── studentsStore.js
│   │   ├── jobsStore.js
│   │   ├── eventsStore.js
│   │   └── clubsStore.js
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── server/
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── server.js             # Express server
│   ├── serviceAccountKey.json # Firebase admin credentials
│   └── .env                  # Environment variables
├── public/                   # Static assets
├── database/                 # SQLite database
└── package.json              # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account and project setup

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd my-Project
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Configure Firebase**

Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
```

Add your Firebase service account key as `serviceAccountKey.json` in the `server` directory.

5. **Start the development servers**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd server
npm run dev
```

6. **Access the application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🔐 Authentication

The application uses Firebase Authentication with the following user roles:
- **Student** - Access to student dashboard and features
- **Teacher** - Access to teacher dashboard and management tools
- **Recruiter** - Access to recruiter dashboard and job posting

## 💾 Data Storage

- **LocalStorage**: Used for client-side data persistence (profiles, skills, experiences)
- **Firebase Firestore**: NoSQL cloud database for user data and application state
- **Firebase Realtime Database**: Real-time data synchronization
- **Firebase Storage**: Cloud storage for file uploads (resumes, certificates, marksheets)
- **SQLite**: Local database for offline data and caching

## 🎨 Key Features Implementation

### Form Validation
- Email format validation
- Phone number validation (10 digits)
- CGPA range validation (0-10)
- Required field checks

### File Upload
- Manual marksheet entry with subject-wise grade input
- Auto-calculation of SGPA based on credits and grades
- Real-time SGPA display as data is entered
- Data saved to localStorage for profile display

### Toast Notifications
- Success/error feedback
- Auto-dismiss after 3 seconds
- User-friendly messages

## 🔒 Security Features

- Firebase Authentication with secure token management
- Firebase Security Rules for database access control
- Protected routes with authentication guards
- Input validation and sanitization
- Secure file upload with Firebase Storage rules
- Environment variable protection
- Disabled developer tools (F12, Ctrl+Shift+I, Ctrl+U)
- Copy/paste protection
- Context menu disabled
- Zoom controls disabled
- Comprehensive code comments for maintainability

## 🌐 Deployment

The project is configured for deployment on Vercel (see `.vercel` directory).

### Build for Production
```bash
npm run build
```

The build output will be in the `dist` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.



## 🐛 Known Issues

- Profile PDF download is currently a placeholder
- Firebase configuration required for full functionality

## 🔮 Future Enhancements

- AI-powered marksheet extraction from images/PDFs
- Real-time notifications
- Chat functionality between users
- Advanced search and filtering
- Analytics dashboard
- Mobile app version
- Email notifications
- Video interview integration
- AI-powered job recommendations
- CGPA calculation across all semesters
- Merit list generation based on SGPA

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Note**: This is an educational project for campus management. Ensure proper security measures before deploying to production.
