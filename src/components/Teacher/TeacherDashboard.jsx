import './TeacherDashboard.css';
import '../Student/StudentDashboard.css';
import '../../theme.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, addEvent, removeEvent } from '../../utils/eventsStore';
import { getJobs, getInternships } from '../../utils/jobsStore';
import { getClubs, deleteClub, addClub } from '../../utils/clubsStore';
import MeritList from './MeritList';
import TeacherMarksheetParser from './TeacherMarksheetParser';
import { getTeacherProfile, saveTeacherProfile } from '../../api/profiles';
import { toast } from '../Toast';
import ClubsContent from './Dashboard/ClubsContent';
import EventsContent from './Dashboard/EventsContent';
import InternshipsContent from './Dashboard/InternshipsContent';
import DashboardContent from './Dashboard/DashboardContent';
import ProfileContent from './Dashboard/ProfileContent';
import { ErrorBoundary } from '../ErrorBoundary';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const closeSidebar = () => setSidebarOpen(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const teacher = JSON.parse(localStorage.getItem('currentTeacher') || '{}');
  const teacherName = teacher.name || teacher.email?.split('@')[0] || 'Teacher';
  const teacherId = teacher.teacher_id || teacher.id || '';
  const teacherDept = teacher.department || 'Computer Science Department';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['internships', 'events', 'clubs', 'merit', 'marksheets', 'dashboard', 'profile'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    
    // Initial check
    handleHashChange();
    
    // Listen for future hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'internships': return 'Internships';
      case 'events': return 'Events';
      case 'clubs': return 'Clubs';
      case 'merit': return 'Merit List';
      case 'marksheets': return 'Marksheet Parser';
      case 'profile': return 'Profile';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardContent teacherName={teacherName} teacherId={teacherId} teacherDept={teacherDept} />;
      case 'internships': return <InternshipsContent />;
      case 'events': return <EventsContent />;
      case 'clubs': return <ClubsContent />;
      case 'merit': return <ErrorBoundary><MeritList /></ErrorBoundary>;
      case 'marksheets': return <ErrorBoundary><TeacherMarksheetParser /></ErrorBoundary>;
      case 'profile': return <ProfileContent teacher={teacher} teacherName={teacherName} teacherId={teacherId} teacherDept={teacherDept} />;
      default: return <DashboardContent teacherName={teacherName} teacherId={teacherId} teacherDept={teacherDept} />;
    }
  };

  return (
    <div className="dashboard-layout teacher-dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />
      <aside className={`sidebar teacher-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div>
            <h3>Smart Campus</h3>
            <p>Teacher Portal</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
            { key: 'marksheets', label: 'Marksheets', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
            { key: 'merit', label: 'Merit List', icon: <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/> },
            { key: 'internships', label: 'Internships', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
            { key: 'events', label: 'Events', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
            { key: 'clubs', label: 'Clubs', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
            { key: 'profile', label: 'Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
          ].map(({ key, label, icon }) => (
            <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => { setActiveTab(key); closeSidebar(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{teacherName[0].toUpperCase()}</div>
            <div>
              <p className="user-name">{teacherName}</p>
              <p className="user-id">{teacherId}</p>
            </div>
          </div>
          <button className="signout-btn" onClick={() => { localStorage.removeItem('currentTeacher'); localStorage.removeItem('token'); navigate('/login'); closeSidebar(); }}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <h2 className="section-title">{getPageTitle()}</h2>
          <div className="header-right">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="dashboard-theme-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {theme === 'dark' ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </>
                )}
              </svg>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}









const DESIGNATIONS = [
  'Professor', 'Associate Professor', 'Assistant Professor',
  'Lecturer', 'Senior Lecturer', 'HOD', 'Dean', 'Other'
];

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Other'
];



export default TeacherDashboard;
