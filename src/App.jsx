import './App.css';
import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import all page components
import Home from './components/Home';
import Login from './components/Login';
import StudentSignup from './components/Student/StudentSignup';
import StudentDashboard from './components/Student/StudentDashboard';
import RecruiterSignup from './components/Recruiter/RecruiterSignup';
import RecruiterLogin from './components/Recruiter/RecruiterLogin';
import RecruiterDashboard from './components/Recruiter/RecruiterDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import TeacherSignup from './components/Teacher/TeacherSignup';

function ProtectedRoute({ element, requiredKey }) {
  const isAuth = !!localStorage.getItem(requiredKey);
  return isAuth ? element : <Navigate to="/login" replace />;
}

function ProtectedRecruiterRoute({ element }) {
  const isAuth = !!localStorage.getItem('currentRecruiter');
  return isAuth ? element : <Navigate to="/recruiter/login" replace />;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/student/dashboard" element={<ProtectedRoute element={<StudentDashboard />} requiredKey="currentStudent" />} />
      <Route path="/teacher/signup" element={<TeacherSignup />} />
      <Route path="/teacher/dashboard" element={<ProtectedRoute element={<TeacherDashboard />} requiredKey="currentTeacher" />} />
      <Route path="/recruiter/signup" element={<RecruiterSignup />} />
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/dashboard" element={<ProtectedRecruiterRoute element={<RecruiterDashboard />} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
