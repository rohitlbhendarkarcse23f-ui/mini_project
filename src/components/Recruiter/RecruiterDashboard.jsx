import './RecruiterDashboard.css';
import '../../theme.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecruiterJobs, addJob, deleteJob, getApplicants, searchCandidates, updateApplicationStatus, getApplicantCounts } from '../../utils/jobsStore';
import { getRecruiterProfile, saveRecruiterProfile, getAllStudents } from '../../api/profiles';
import { toast } from '../Toast';
import ProfileContent from './Dashboard/ProfileContent';
import ApplicantsContent from './Dashboard/ApplicantsContent';
import CandidatesContent from './Dashboard/CandidatesContent';
import JobsContent from './Dashboard/JobsContent';
import InternshipsContent from './Dashboard/InternshipsContent';
import DashboardContent from './Dashboard/DashboardContent';

function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const closeSidebar = () => setSidebarOpen(false);
  const [recruiter, setRecruiter] = useState(() => {
    const stored = localStorage.getItem('currentRecruiter');
    return stored ? JSON.parse(stored) : { recruiter_id: '', company_id: '', company: '', email: '' };
  });
  // Use company_id for all shared data; fall back to recruiter_id for legacy
  const cid = recruiter.company_id || recruiter.recruiter_id;

  // If localStorage has an old token without company_id, force re-login once
  useEffect(() => {
    if (!recruiter.company_id && recruiter.recruiter_id) {
      // Patch localStorage so cid works without re-login
      const stored = JSON.parse(localStorage.getItem('currentRecruiter') || '{}');
      if (!stored.company_id) {
        stored.company_id = stored.recruiter_id;
        localStorage.setItem('currentRecruiter', JSON.stringify(stored));
        setRecruiter(stored);
      }
    }
  }, []);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['dashboard', 'internships', 'jobs', 'applicants', 'candidates', 'profile'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'internships': return 'Internships';
      case 'jobs': return 'Job Postings';
      case 'applicants': return 'Applicants';
      case 'candidates': return 'Find Candidates';
      case 'profile': return 'Company Profile';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardContent setActiveTab={setActiveTab} cid={cid} recruiter={recruiter} />;
      case 'internships': return <InternshipsContent cid={cid} />;
      case 'jobs': return <JobsContent cid={cid} />;
      case 'applicants': return <ApplicantsContent cid={cid} />;
      case 'candidates': return <CandidatesContent />;
      case 'profile': return <ProfileContent cid={cid} recruiter={recruiter} />;
      default: return <DashboardContent setActiveTab={setActiveTab} cid={cid} recruiter={recruiter} />;
    }
  };

  return (
    <div className="recruiter-dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />
      <aside className={`recruiter-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="recruiter-sidebar-header">
          <div className="recruiter-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div>
            <h3>{recruiter.company}</h3>
            <p>Recruiter Portal</p>
          </div>
        </div>
        
        <nav className="recruiter-sidebar-nav">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
            { key: 'jobs', label: 'Job Postings', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
            { key: 'internships', label: 'Internships', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
            { key: 'applicants', label: 'Applicants', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
            { key: 'candidates', label: 'Find Candidates', icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
            { key: 'profile', label: 'Company Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
          ].map(({ key, label, icon }) => (
            <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => { setActiveTab(key); closeSidebar(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{recruiter.company ? recruiter.company[0].toUpperCase() : 'D'}</div>
            <div>
              <p className="user-name">{recruiter.company}</p>
              <p className="user-id">{recruiter.role || recruiter.recruiter_id}</p>
            </div>
          </div>
          <button className="signout-btn" onClick={() => { localStorage.removeItem('currentRecruiter'); localStorage.removeItem('token'); navigate('/recruiter/login'); closeSidebar(); }}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <h2 className="section-title">{getPageTitle()}</h2>
          <div className="header-right">
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="dashboard-theme-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {theme === 'dark' ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/> : <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></> }
              </svg>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <div className="profile-btn" onClick={() => setActiveTab('profile')} title="Company Profile" style={{cursor:'pointer'}}>
              {recruiter.company ? recruiter.company[0].toUpperCase() : 'R'}
            </div>
          </div>
        </div>
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}













export default RecruiterDashboard;
