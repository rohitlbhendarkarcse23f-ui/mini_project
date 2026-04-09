import './StudentDashboard.css';
import './StudentDashboard2.css';
import '../../theme.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getRemovedEvents } from '../../utils/eventsStore';
import { getJobs, getInternships, applyForJob } from '../../utils/jobsStore';
import { getClubs } from '../../utils/clubsStore';
import MarksheetUpload from './MarksheetUpload';
import AIMarksheetUpload from './AIMarksheetUpload';
import { getStudentProfile, saveStudentProfile, saveSkills, saveExperiences, saveCertificates, saveMarksheets, uploadFile } from '../../api/profiles';
import { toast } from '../Toast';
import ProfileContent from './Dashboard/ProfileContent';
import PaymentsContent from './Dashboard/PaymentsContent';
import ClubsContent from './Dashboard/ClubsContent';
import MessagesContent from './Dashboard/MessagesContent';
import EventsContent from './Dashboard/EventsContent';
import MeritListContent from './Dashboard/MeritListContent';
import JobsContent from './Dashboard/JobsContent';
import InternshipsContent from './Dashboard/InternshipsContent';
import DashboardContent from './Dashboard/DashboardContent';

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [student, setStudent] = useState(() => {
    const stored = localStorage.getItem('currentStudent');
    return stored ? JSON.parse(stored) : {};
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['internships', 'jobs', 'events', 'clubs', 'profile'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'internships': return 'Internships';
      case 'jobs': return 'Job Placements';
      case 'events': return 'Events';
      case 'clubs': return 'Clubs';
      case 'messages': return 'Messages';
      case 'profile': return 'Profile';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardContent />;
      case 'internships': return <InternshipsContent />;
      case 'jobs': return <JobsContent />;
      case 'events': return <EventsContent />;
      case 'clubs': return <ClubsContent />;
      case 'profile': return <ProfileContent />;
      case 'messages': return <MessagesContent />;
      default: return <DashboardContent />;
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout student-dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div>
            <h3>Smart Campus</h3>
            <p>Student Portal</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
            { key: 'jobs', label: 'Jobs', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
            { key: 'internships', label: 'Internships', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
            { key: 'events', label: 'Events', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
            { key: 'clubs', label: 'Clubs', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
            { key: 'messages', label: 'Messages', icon: <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/> },
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
            <div className="avatar">{(student.name || student.student_id || 'S')[0].toUpperCase()}</div>
            <div>
              <p className="user-name">{student.name || student.email?.split('@')[0] || 'Student'}</p>
              <p className="user-id">{student.student_id || ''}</p>
            </div>
          </div>
          <button className="signout-btn" onClick={() => { localStorage.removeItem('currentStudent'); localStorage.removeItem('token'); navigate('/login'); closeSidebar(); }}>Sign Out</button>
          <button className="home-link-btn" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <h2 className="section-title">{getPageTitle()}</h2>
          <div className="header-right">
            <NotificationBell />
            <div className="header-profile-chip">
              <div className="header-avatar">{(student.name || student.student_id || 'S')[0].toUpperCase()}</div>
              <div className="header-profile-info">
                <span className="header-profile-name">{student.name || student.email?.split('@')[0] || 'Student'}</span>
                <span className="header-profile-id">{student.student_id}</span>
              </div>
            </div>
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

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Other'
];

function NotificationBell() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => parseInt(localStorage.getItem('notif_seen') || '0'));

  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    let es;
    try {
      es = new EventSource(`${API}/messages/stream?token=${token}`);
      es.onmessage = (e) => {
        try {
          const { type, events = [], jobs = [] } = JSON.parse(e.data);
          if (type === 'init' || type === 'update') {
            const evN = events.slice(0, 3).map(ev => ({ id: `ev_${ev._id}`, text: `New event: ${ev.title}`, time: ev.date || '', type: 'event' }));
            const jobN = jobs.slice(0, 3).map(j => ({ id: `job_${j._id}`, text: `New job: ${j.role} at ${j.company}`, time: j.deadline || '', type: 'job' }));
            setNotifs([...evN, ...jobN]);
          }
        } catch {}
      };
      es.onerror = () => es.close();
    } catch {
      // SSE not available, fall back to one-time fetch
      Promise.all([
        fetch(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
        fetch(`${API}/jobs`,   { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => [])
      ]).then(([events, jobs]) => {
        const evN  = (Array.isArray(events) ? events : []).slice(0, 3).map(e => ({ id: `ev_${e._id||e.id}`, text: `New event: ${e.title}`, time: e.date || '', type: 'event' }));
        const jobN = (Array.isArray(jobs)   ? jobs   : []).slice(0, 3).map(j => ({ id: `job_${j._id||j.id}`, text: `New job: ${j.role} at ${j.company}`, time: j.deadline || '', type: 'job' }));
        setNotifs([...evN, ...jobN]);
      });
    }
    return () => es?.close();
  }, []);

  const unread = Math.max(0, notifs.length - seen);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) { setSeen(notifs.length); localStorage.setItem('notif_seen', notifs.length); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '44px', width: '300px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: '600', fontSize: '14px' }}>Notifications</div>
          {notifs.length === 0
            ? <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No notifications</div>
            : notifs.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'event' ? '#3b82f6' : '#10b981', marginTop: '5px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '2px' }}>{n.text}</p>
                  {n.time && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{n.time}</span>}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}







const API_BASE_MSG = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';











function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function readSgpaFromStorage(studentId) {
  const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
  const profile = profiles[studentId] || {};
  const sgpaList = profile.sgpaList || [];
  const validSgpas = sgpaList.filter(v => v != null && v > 0);
  return {
    currentSgpa: validSgpas.length > 0 ? validSgpas[validSgpas.length - 1] : 0,
    cgpa: profile.cgpa || 0,
    semester: profile.semester || null,
  };
}



export default StudentDashboard;
