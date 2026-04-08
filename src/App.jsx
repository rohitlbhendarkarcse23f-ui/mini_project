import './App.css';
import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/Toast';

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
import NotFound from './components/NotFound';

function ProtectedRoute({ element, requiredKey }) {
  const isAuth = !!localStorage.getItem(requiredKey);
  return isAuth ? element : <Navigate to="/login" replace />;
}

function ProtectedRecruiterRoute({ element }) {
  const isAuth = !!localStorage.getItem('currentRecruiter');
  return isAuth ? element : <Navigate to="/recruiter/login" replace />;
}

const PAGE_TITLES = {
  '/':                    'Campus Connect | KDK College of Engineering',
  '/login':               'Sign In | Campus Connect',
  '/student/signup':      'Student Registration | Campus Connect',
  '/student/dashboard':   'Student Dashboard | Campus Connect',
  '/teacher/signup':      'Teacher Registration | Campus Connect',
  '/teacher/dashboard':   'Teacher Dashboard | Campus Connect',
  '/recruiter/signup':    'Recruiter Registration | Campus Connect',
  '/recruiter/login':     'Recruiter Sign In | Campus Connect',
  '/recruiter/dashboard': 'Recruiter Dashboard | Campus Connect',
};

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = PAGE_TITLES[location.pathname] ?? 'Campus Connect';
  }, [location.pathname]);

  return (
    <>
      <ToastContainer />
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
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
