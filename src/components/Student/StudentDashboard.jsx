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

function ProfileContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMarksheetModal, setShowMarksheetModal] = useState(false);
  const [marksheetTab, setMarksheetTab] = useState('manual');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  const showToastMsg = (msg) => toast(msg);

  const [profileData, setProfileData] = useState({
    name: student.name || student.email?.split('@')[0] || '',
    email: student.email || '',
    phone: student.phone || '',
    department: student.department || '',
    address: '',
    bio: '',
    year: student.year || 1,
    semester: parseInt(student.semester) || 1,
    cgpa: 0,
    student_id: student.student_id || ''
  });

  const [formData, setFormData] = useState({...profileData});
  const [errors, setErrors] = useState({});
  const [resume, setResume] = useState(null);
  const [marksheets, setMarksheets] = useState({});
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({name: '', percent: 50, color: '#3b82f6'});
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [newExp, setNewExp] = useState({role: '', company: '', duration: '', type: 'Internship', desc: '', link: ''});
  const [newCert, setNewCert] = useState({name: '', issuer: '', year: '', link: ''});
  const [expUploading, setExpUploading] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  useEffect(() => {
    if (!student.student_id) return;
    getStudentProfile(student.student_id).then(data => {
      if (data) {
        setProfileData(prev => ({ ...prev, ...data }));
        setFormData(prev => ({ ...prev, ...data }));
        setSkills(data.skills || []);
        setExperiences(data.experiences || []);
        setCertificates(data.certificates || []);
        if (Array.isArray(data.marksheets)) {
          const ms = {};
          data.marksheets.forEach(m => { ms[m.semester] = m; });
          setMarksheets(ms);
        }
      }
    }).catch(() => {});
  }, [student.student_id]);

  // ── Edit Profile ──────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(formData.phone)) e.phone = 'Phone must be 10 digits';
    if (!formData.department) e.department = 'Department is required';
    if (!formData.year) e.year = 'Year is required';
    if (!formData.semester) e.semester = 'Semester is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateForm()) return;
    const updated = {...formData};
    setProfileData(updated);
    // Update localStorage so sidebar/header reflect new name
    const stored = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    localStorage.setItem('currentStudent', JSON.stringify({...stored, ...updated}));
    saveStudentProfile(student.student_id, {...updated, skills, experiences, certificates}).catch(() => {});
    setShowEditModal(false);
    showToastMsg('Profile updated successfully');
  };

  // ── ID Card Generator ─────────────────────────────────────────
  const handleDownloadIdCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 400);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 640, 400, 20);
    ctx.fill();

    // Top accent bar
    const accent = ctx.createLinearGradient(0, 0, 640, 0);
    accent.addColorStop(0, '#3b82f6');
    accent.addColorStop(1, '#2563eb');
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 640, 8);

    // College logo area (circle)
    ctx.fillStyle = 'rgba(59,130,246,0.15)';
    ctx.beginPath(); ctx.arc(80, 80, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(80, 80, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center'; ctx.fillText('SC', 80, 90);

    // College name
    ctx.fillStyle = 'white'; ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left'; ctx.fillText('Smart Campus', 140, 68);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '13px Arial';
    ctx.fillText('KDK College of Engineering', 140, 90);

    // STUDENT ID CARD label
    ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right'; ctx.fillText('STUDENT IDENTITY CARD', 620, 68);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '11px Arial';
    ctx.fillText(`Valid: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 620, 86);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(32, 140); ctx.lineTo(608, 140); ctx.stroke();

    // Avatar circle
    ctx.fillStyle = 'rgba(59,130,246,0.2)';
    ctx.beginPath(); ctx.arc(88, 230, 60, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(88, 230, 60, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText((profileData.name || 'S')[0].toUpperCase(), 88, 248);

    // Student details
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white'; ctx.font = 'bold 24px Arial';
    ctx.fillText(profileData.name || 'Student Name', 176, 180);

    ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 14px Arial';
    ctx.fillText(profileData.student_id || '', 176, 206);

    const details = [
      ['Department', profileData.department || 'N/A'],
      ['Year / Semester', `Year ${profileData.year || 1}  ·  Semester ${profileData.semester || 1}`],
      ['Email', profileData.email || ''],
      ['Phone', profileData.phone ? `+91 ${profileData.phone}` : 'N/A'],
    ];
    let y = 236;
    details.forEach(([label, value]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px Arial';
      ctx.fillText(label.toUpperCase(), 176, y);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '14px Arial';
      ctx.fillText(value, 176, y + 18);
      y += 42;
    });

    // Bottom bar
    ctx.fillStyle = 'rgba(59,130,246,0.15)';
    ctx.fillRect(0, 360, 640, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('This card is the property of Smart Campus · If found, please return to the college office', 320, 385);

    // Download
    const link = document.createElement('a');
    link.download = `${profileData.student_id || 'student'}_id_card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToastMsg('ID Card downloaded!');
  };

  // ── Download Profile PDF ──────────────────────────────────────
  const handleDownloadProfile = async () => {
    showToastMsg('Generating PDF...');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, margin = 20;

      // Header
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, W, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22); doc.setFont('helvetica', 'bold');
      doc.text('Smart Campus', margin, 18);
      doc.setFontSize(11); doc.setFont('helvetica', 'normal');
      doc.text('Student Profile', margin, 28);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, W - margin, 28, { align: 'right' });

      let y = 58;
      const section = (title) => {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y - 5, W - margin * 2, 8, 'F');
        doc.setTextColor(30, 58, 138); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 2, y + 1);
        y += 12;
        doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      };
      const row = (label, value) => {
        doc.setTextColor(100, 100, 100); doc.text(label + ':', margin + 2, y);
        doc.setTextColor(30, 30, 30); doc.text(String(value || 'N/A'), margin + 55, y);
        y += 7;
      };

      section('Personal Information');
      row('Full Name', profileData.name);
      row('Student ID', profileData.student_id);
      row('Email', profileData.email);
      row('Phone', profileData.phone ? `+91 ${profileData.phone}` : '');
      row('Address', profileData.address || '');
      y += 4;

      section('Academic Information');
      row('Department', profileData.department);
      row('Year', `Year ${profileData.year}`);
      row('Semester', `Semester ${profileData.semester}`);
      row('CGPA', profileData.cgpa ? profileData.cgpa.toFixed(2) : '0.00');
      if (profileData.bio) { row('Bio', ''); doc.text(doc.splitTextToSize(profileData.bio, W - margin * 2 - 55), margin + 55, y - 7); y += 10; }
      y += 4;

      if (skills.length > 0) {
        section('Skills');
        skills.forEach(s => { row(s.name, `${s.percent}%`); });
        y += 4;
      }

      if (experiences.length > 0) {
        section('Experience');
        experiences.forEach(e => {
          row(e.role, `${e.company} · ${e.duration} (${e.type})`);
        });
        y += 4;
      }

      if (certificates.length > 0) {
        section('Certificates');
        certificates.forEach(c => { row(c.name, `${c.issuer} · ${c.year}`); });
      }

      doc.save(`${profileData.name || 'student'}_profile.pdf`);
      showToastMsg('Profile PDF downloaded!');
    } catch (err) {
      showToastMsg('PDF generation failed');
    }
  };

  // ── Skills ────────────────────────────────────────────────────
  const handleAddSkill = () => {
    if (!newSkill.name) { showToastMsg('Please enter skill name'); return; }
    const updatedSkills = [...skills, {...newSkill}];
    setSkills(updatedSkills);
    saveSkills(student.student_id, updatedSkills).catch(() => {});
    setNewSkill({name: '', percent: 50, color: '#3b82f6'});
    showToastMsg('Skill added');
  };
  const handleRemoveSkill = (i) => {
    const updated = skills.filter((_, idx) => idx !== i);
    setSkills(updated); saveSkills(student.student_id, updated).catch(() => {});
    showToastMsg('Skill removed');
  };

  // ── Experience ────────────────────────────────────────────────
  const handleAddExperience = () => {
    if (!newExp.role || !newExp.company || !newExp.duration) { showToastMsg('Please fill all required fields'); return; }
    const updated = [...experiences, {...newExp, id: Date.now()}];
    setExperiences(updated); saveExperiences(student.student_id, updated).catch(() => {});
    setNewExp({role: '', company: '', duration: '', type: 'Internship', desc: '', link: ''});
    setShowExpModal(false); showToastMsg('Experience added');
  };
  const handleRemoveExperience = (key) => {
    const updated = experiences.filter(e => (e._id || e.id) !== key);
    setExperiences(updated); saveExperiences(student.student_id, updated).catch(() => {});
    showToastMsg('Experience removed');
  };

  // ── Certificates ──────────────────────────────────────────────
  const handleAddCertificate = () => {
    if (!newCert.name || !newCert.issuer || !newCert.year) { showToastMsg('Please fill all required fields'); return; }
    const updated = [...certificates, {...newCert, id: Date.now()}];
    setCertificates(updated); saveCertificates(student.student_id, updated).catch(() => {});
    setNewCert({name: '', issuer: '', year: '', link: ''});
    setShowCertModal(false); showToastMsg('Certificate added');
  };
  const handleRemoveCertificate = (key) => {
    const updated = certificates.filter(c => (c._id || c.id) !== key);
    setCertificates(updated); saveCertificates(student.student_id, updated).catch(() => {});
    showToastMsg('Certificate removed');
  };

  // ── Resume ────────────────────────────────────────────────────
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { showToastMsg('Only PDF files allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { showToastMsg('File must be under 2MB'); return; }
    setResume(file); showToastMsg('Resume uploaded');
  };
  
  const sel = (f, v) => setFormData(p => ({...p, [f]: v}));
  const inputStyle = {width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'white',fontSize:'14px',fontFamily:'Inter,sans-serif'};
  const errStyle = {color:'#f87171',fontSize:'12px',marginTop:'4px',display:'block'};

  return (
    <div className="profile-content">
      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" style={{maxWidth:'560px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                <div>
                  <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Full Name *</label>
                  <input style={inputStyle} value={formData.name} onChange={e => sel('name', e.target.value)} placeholder="Rahul Sharma" />
                  {errors.name && <span style={errStyle}>{errors.name}</span>}
                </div>
                <div>
                  <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Phone *</label>
                  <input style={inputStyle} type="tel" value={formData.phone} onChange={e => sel('phone', e.target.value)} placeholder="10-digit number" />
                  {errors.phone && <span style={errStyle}>{errors.phone}</span>}
                </div>
              </div>
              <div>
                <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Department *</label>
                <select style={{...inputStyle,cursor:'pointer'}} value={formData.department} onChange={e => sel('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d} style={{background:'#0B0F19'}}>{d}</option>)}
                </select>
                {errors.department && <span style={errStyle}>{errors.department}</span>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                <div>
                  <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Year *</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={formData.year} onChange={e => { sel('year', parseInt(e.target.value)); sel('semester', ''); }}>
                    <option value="">Select Year</option>
                    {[1,2,3,4].map(y => <option key={y} value={y} style={{background:'#0B0F19'}}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year</option>)}
                  </select>
                  {errors.year && <span style={errStyle}>{errors.year}</span>}
                </div>
                <div>
                  <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Semester *</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={formData.semester} onChange={e => sel('semester', parseInt(e.target.value))}>
                    <option value="">Select Semester</option>
                    {formData.year && [1,2].map(s => {
                      const sem = (parseInt(formData.year) - 1) * 2 + s;
                      return <option key={sem} value={sem} style={{background:'#0B0F19'}}>Semester {sem}</option>;
                    })}
                  </select>
                  {errors.semester && <span style={errStyle}>{errors.semester}</span>}
                </div>
              </div>
              <div>
                <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Address</label>
                <input style={inputStyle} value={formData.address || ''} onChange={e => sel('address', e.target.value)} placeholder="Your address" />
              </div>
              <div>
                <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Bio</label>
                <textarea style={{...inputStyle,minHeight:'80px',resize:'vertical'}} value={formData.bio || ''} onChange={e => sel('bio', e.target.value)} placeholder="Tell something about yourself..." />
              </div>
              <button className="save-changes-btn" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ID Card Preview Modal ── */}
      {showIdCard && (
        <div className="modal-overlay" onClick={() => setShowIdCard(false)}>
          <div className="modal-content" style={{maxWidth:'680px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student ID Card</h2>
              <button className="close-btn" onClick={() => setShowIdCard(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* ID Card Preview */}
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a8a)',borderRadius:'16px',padding:'0',overflow:'hidden',border:'1px solid rgba(59,130,246,0.3)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
                <div style={{height:'8px',background:'linear-gradient(90deg,#3b82f6,#2563eb)'}}></div>
                <div style={{padding:'28px 32px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                      <div style={{width:'52px',height:'52px',background:'rgba(59,130,246,0.2)',borderRadius:'50%',border:'2px solid #3b82f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'700',color:'#60a5fa'}}>SC</div>
                      <div>
                        <div style={{fontSize:'18px',fontWeight:'700',color:'white'}}>Smart Campus</div>
                        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>KDK College of Engineering</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'11px',fontWeight:'700',color:'#60a5fa',letterSpacing:'1px'}}>STUDENT IDENTITY CARD</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginTop:'4px'}}>Valid: {new Date().getFullYear()}–{new Date().getFullYear()+1}</div>
                    </div>
                  </div>
                  <div style={{height:'1px',background:'rgba(255,255,255,0.1)',marginBottom:'24px'}}></div>
                  <div style={{display:'flex',gap:'24px',alignItems:'center'}}>
                    <div style={{width:'80px',height:'80px',background:'rgba(59,130,246,0.2)',borderRadius:'50%',border:'3px solid #3b82f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'36px',fontWeight:'700',color:'#60a5fa',flexShrink:0}}>
                      {(profileData.name || 'S')[0].toUpperCase()}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'22px',fontWeight:'700',color:'white',marginBottom:'4px'}}>{profileData.name || 'Student Name'}</div>
                      <div style={{fontSize:'13px',color:'#60a5fa',fontWeight:'600',marginBottom:'16px'}}>{profileData.student_id}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                        {[['Department', profileData.department || 'N/A'],['Year / Semester', `Year ${profileData.year || 1} · Sem ${profileData.semester || 1}`],['Email', profileData.email || 'N/A'],['Phone', profileData.phone ? `+91 ${profileData.phone}` : 'N/A']].map(([l,v]) => (
                          <div key={l}>
                            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'2px'}}>{l}</div>
                            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.9)'}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:'24px',padding:'10px 16px',background:'rgba(59,130,246,0.1)',borderRadius:'8px',fontSize:'11px',color:'rgba(255,255,255,0.4)',textAlign:'center'}}>
                    This card is the property of Smart Campus · If found, please return to the college office
                  </div>
                </div>
              </div>
              <button className="save-changes-btn" style={{marginTop:'20px'}} onClick={() => { handleDownloadIdCard(); setShowIdCard(false); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download ID Card (PNG)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">{(profileData.name || profileData.student_id || 'S')[0].toUpperCase()}</div>
          <div className="profile-header-info">
            <h2>{profileData.name || 'Student'}</h2>
            <p>{profileData.department || 'Department not set'} · Semester {profileData.semester}</p>
            <span className="student-id-badge">ID: {profileData.student_id}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={handleDownloadProfile}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Profile
          </button>
          <button className="edit-profile-btn" onClick={() => { setFormData({...profileData}); setShowEditModal(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-left">
          <div className="profile-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Personal Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <div><label>Full Name</label><p>{profileData.name}</p></div>
              </div>
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <div><label>Email</label><p>{profileData.email}</p></div>
              </div>
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div><label>Phone</label><p>+91 {profileData.phone}</p></div>
              </div>
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <div><label>Department</label><p>{profileData.department}</p></div>
              </div>
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <div><label>Student ID</label><p>{profileData.student_id}</p></div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Experience
              <button onClick={() => setShowExpModal(true)} style={{marginLeft:'auto',padding:'4px 12px',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'6px',color:'#60a5fa',cursor:'pointer',fontSize:'12px'}}>+ Add</button>
            </h3>
            <div className="experience-list">
              {experiences.length === 0 ? (
                <p style={{color:'rgba(255,255,255,0.4)',textAlign:'center',padding:'20px 0',fontSize:'13px'}}>No experience added yet.</p>
              ) : (
                experiences.map((exp, idx) => {
                  const key = exp._id || exp.id || idx;
                  return (
                    <div key={key} className="experience-item">
                      <div className="exp-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      </div>
                      <div className="exp-details" style={{flex:1}}>
                        <h4>{exp.role}</h4>
                        <p>{exp.company}</p>
                        <div className="exp-meta">
                          <span>{exp.duration}</span>
                          <span className={`exp-badge ${exp.type === 'Volunteer' ? 'volunteer' : ''}`}>{exp.type}</span>
                        </div>
                        {exp.desc && <p style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>{exp.desc}</p>}
                        {exp.link && (
                          <a href={exp.link} target="_blank" rel="noreferrer" style={{fontSize:'12px',color:'#60a5fa',marginTop:'4px',display:'inline-flex',alignItems:'center',gap:'4px'}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            View Proof
                          </a>
                        )}
                      </div>
                      <button onClick={() => handleRemoveExperience(key)} style={{padding:'6px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'6px',color:'#f87171',cursor:'pointer',fontSize:'12px',flexShrink:0}}>Remove</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {showExpModal && (
            <div className="modal-overlay" onClick={() => setShowExpModal(false)}>
              <div className="modal-content" style={{maxWidth:'520px'}} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Experience</h2>
                  <button className="close-btn" onClick={() => setShowExpModal(false)}>×</button>
                </div>
                <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                    <div>
                      <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Role / Position *</label>
                      <input style={inputStyle} value={newExp.role} onChange={e => setNewExp({...newExp, role: e.target.value})} placeholder="e.g. Web Dev Intern" />
                    </div>
                    <div>
                      <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Company / Organization *</label>
                      <input style={inputStyle} value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} placeholder="e.g. TechStartup Inc." />
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                    <div>
                      <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Duration *</label>
                      <input style={inputStyle} value={newExp.duration} onChange={e => setNewExp({...newExp, duration: e.target.value})} placeholder="e.g. Jun–Aug 2024" />
                    </div>
                    <div>
                      <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Type *</label>
                      <select style={{...inputStyle,cursor:'pointer'}} value={newExp.type} onChange={e => setNewExp({...newExp, type: e.target.value})}>
                        <option style={{background:'#0B0F19'}}>Internship</option>
                        <option style={{background:'#0B0F19'}}>Full-time</option>
                        <option style={{background:'#0B0F19'}}>Part-time</option>
                        <option style={{background:'#0B0F19'}}>Volunteer</option>
                        <option style={{background:'#0B0F19'}}>Freelance</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Description</label>
                    <textarea style={{...inputStyle,minHeight:'72px',resize:'vertical'}} value={newExp.desc} onChange={e => setNewExp({...newExp, desc: e.target.value})} placeholder="Brief description of your role and responsibilities..." />
                  </div>
                  <div>
                    <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Offer Letter / Proof (PDF or Image, max 5MB)</label>
                    <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                      <label style={{flex:1,padding:'10px 14px',background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.2)',borderRadius:'10px',cursor:'pointer',fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',gap:'8px'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        {newExp.file ? newExp.file.name : 'Choose file...'}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{display:'none'}} onChange={e => {
                          const f = e.target.files[0];
                          if (f && f.size > 5*1024*1024) { showToastMsg('File must be under 5MB'); return; }
                          if (f) setNewExp(p => ({...p, file: f}));
                        }} />
                      </label>
                      {newExp.file && <button onClick={() => setNewExp(p => ({...p, file: null}))} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#f87171',cursor:'pointer',fontSize:'12px'}}>Clear</button>}
                    </div>
                    {newExp.link && !newExp.file && <p style={{fontSize:'12px',color:'#60a5fa',marginTop:'6px'}}>Current: <a href={newExp.link} target="_blank" rel="noreferrer" style={{color:'#60a5fa'}}>{newExp.link}</a></p>}
                  </div>
                  <button className="save-changes-btn" disabled={expUploading} onClick={async () => {
                    if (!newExp.role || !newExp.company || !newExp.duration) { showToastMsg('Please fill all required fields'); return; }
                    setExpUploading(true);
                    let fileUrl = newExp.link || '';
                    if (newExp.file) {
                      try {
                        const res = await uploadFile(newExp.file, 'experience');
                        fileUrl = `http://localhost:5000${res.url}`;
                      } catch { showToastMsg('File upload failed, saving without file'); }
                    }
                    const updated = [...experiences, {role:newExp.role, company:newExp.company, duration:newExp.duration, type:newExp.type, desc:newExp.desc, link:fileUrl, id:Date.now()}];
                    setExperiences(updated);
                    saveExperiences(student.student_id, updated).catch(() => {});
                    setNewExp({role:'',company:'',duration:'',type:'Internship',desc:'',link:'',file:null});
                    setShowExpModal(false);
                    setExpUploading(false);
                    showToastMsg('Experience added');
                  }}>
                    {expUploading ? 'Uploading...' : 'Add Experience'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Certificates
              <button onClick={() => setShowCertModal(true)} style={{marginLeft:'auto',padding:'4px 12px',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'6px',color:'#60a5fa',cursor:'pointer',fontSize:'12px'}}>+ Add</button>
            </h3>
            <div className="certificates-list">
              {certificates.length === 0 ? (
                <p style={{color:'rgba(255,255,255,0.4)',textAlign:'center',padding:'20px 0',fontSize:'13px'}}>No certificates added yet.</p>
              ) : (
                certificates.map((cert, idx) => {
                  const key = cert._id || cert.id || idx;
                  return (
                    <div key={key} className="cert-item">
                      <div className="cert-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      </div>
                      <div style={{flex:1}}>
                        <h4 style={{fontSize:'14px',marginBottom:'2px'}}>{cert.name}</h4>
                        <p style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>{cert.issuer} · {cert.year}</p>
                        {cert.link && (
                          <a href={cert.link} target="_blank" rel="noreferrer" style={{fontSize:'12px',color:'#60a5fa',marginTop:'2px',display:'inline-flex',alignItems:'center',gap:'4px'}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            View Certificate
                          </a>
                        )}
                      </div>
                      <button onClick={() => handleRemoveCertificate(key)} style={{padding:'6px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'6px',color:'#f87171',cursor:'pointer',fontSize:'12px',flexShrink:0}}>Remove</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {showCertModal && (
            <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
              <div className="modal-content" style={{maxWidth:'520px'}} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Certificate</h2>
                  <button className="close-btn" onClick={() => setShowCertModal(false)}>×</button>
                </div>
                <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                  <div>
                    <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Certificate Name *</label>
                    <input style={inputStyle} value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} placeholder="e.g. AWS Cloud Practitioner" />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                    <div>
                      <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Issuing Organization *</label>
                      <input style={inputStyle} value={newCert.issuer} onChange={e => setNewCert({...newCert, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" />
                    </div>
                    <div>
                      <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Year *</label>
                      <input style={inputStyle} value={newCert.year} onChange={e => setNewCert({...newCert, year: e.target.value})} placeholder="e.g. 2024" />
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Certificate File (PDF or Image, max 5MB)</label>
                    <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                      <label style={{flex:1,padding:'10px 14px',background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.2)',borderRadius:'10px',cursor:'pointer',fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',gap:'8px'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        {newCert.file ? newCert.file.name : 'Choose file...'}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{display:'none'}} onChange={e => {
                          const f = e.target.files[0];
                          if (f && f.size > 5*1024*1024) { showToastMsg('File must be under 5MB'); return; }
                          if (f) setNewCert(p => ({...p, file: f}));
                        }} />
                      </label>
                      {newCert.file && <button onClick={() => setNewCert(p => ({...p, file: null}))} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#f87171',cursor:'pointer',fontSize:'12px'}}>Clear</button>}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Or paste Credential URL</label>
                    <input style={inputStyle} type="url" value={newCert.link} onChange={e => setNewCert({...newCert, link: e.target.value})} placeholder="https://www.credly.com/badges/..." />
                    <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginTop:'4px'}}>File upload takes priority over URL if both are provided.</p>
                  </div>
                  <button className="save-changes-btn" disabled={certUploading} onClick={async () => {
                    if (!newCert.name || !newCert.issuer || !newCert.year) { showToastMsg('Please fill all required fields'); return; }
                    setCertUploading(true);
                    let fileUrl = newCert.link || '';
                    if (newCert.file) {
                      try {
                        const res = await uploadFile(newCert.file, 'certificate');
                        fileUrl = `http://localhost:5000${res.url}`;
                      } catch { showToastMsg('File upload failed, saving without file'); }
                    }
                    const updated = [...certificates, {name:newCert.name, issuer:newCert.issuer, year:newCert.year, link:fileUrl, id:Date.now()}];
                    setCertificates(updated);
                    saveCertificates(student.student_id, updated).catch(() => {});
                    setNewCert({name:'',issuer:'',year:'',link:'',file:null});
                    setShowCertModal(false);
                    setCertUploading(false);
                    showToastMsg('Certificate added');
                  }}>
                    {certUploading ? 'Uploading...' : 'Add Certificate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-right">
          <div className="profile-section">
            <h3>Academic Info</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
              <div style={{textAlign:'center',padding:'16px',background:'rgba(59,130,246,0.08)',borderRadius:'12px',border:'1px solid rgba(59,130,246,0.2)'}}>
                <div style={{fontSize:'28px',fontWeight:'700',color:'#22c55e'}}>{profileData.cgpa ? profileData.cgpa.toFixed(2) : '—'}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>CGPA / 10.0</div>
              </div>
              <div style={{textAlign:'center',padding:'16px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:'28px',fontWeight:'700',color:'white'}}>Year {profileData.year || '—'}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>Current Year</div>
              </div>
              <div style={{textAlign:'center',padding:'16px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:'28px',fontWeight:'700',color:'white'}}>Sem {profileData.semester || '—'}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>Current Semester</div>
              </div>
            </div>

            {/* Semester-wise SGPA table */}
            {(() => {
              const localProfiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
              const localProfile = localProfiles[profileData.student_id] || {};
              const sgpaList = profileData.sgpaList || localProfile.sgpaList || [];
              const validEntries = sgpaList.map((sgpa, idx) => ({ sem: idx + 1, sgpa })).filter(e => e.sgpa != null && e.sgpa > 0);
              if (validEntries.length === 0) return (
                <div style={{textAlign:'center',padding:'20px',color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>
                  No SGPA data yet. Upload your marksheet to see semester-wise SGPA.
                </div>
              );
              return (
                <div>
                  <p style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginBottom:'10px'}}>Semester-wise SGPA</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {validEntries.map(({ sem, sgpa }) => (
                      <div key={sem} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',width:'56px',flexShrink:0}}>Sem {sem}</span>
                        <div style={{flex:1,height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'3px',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${(sgpa/10)*100}%`,background: sgpa >= 8.5 ? '#22c55e' : sgpa >= 7 ? '#3b82f6' : sgpa >= 5.5 ? '#f59e0b' : '#ef4444',borderRadius:'3px',transition:'width 0.4s'}}></div>
                        </div>
                        <span style={{fontSize:'13px',fontWeight:'600',color: sgpa >= 8.5 ? '#22c55e' : sgpa >= 7 ? '#60a5fa' : sgpa >= 5.5 ? '#fbbf24' : '#f87171',width:'36px',textAlign:'right',flexShrink:0}}>{sgpa.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {validEntries.length > 1 && (
                    <div style={{marginTop:'12px',padding:'10px 14px',background:'rgba(59,130,246,0.06)',borderRadius:'8px',display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                      <span style={{color:'rgba(255,255,255,0.5)'}}>Overall CGPA</span>
                      <strong style={{color:'#22c55e'}}>{profileData.cgpa ? profileData.cgpa.toFixed(2) : '—'} / 10.0</strong>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="profile-section">
            <h3>
              Skills
              <button className="add-btn" onClick={() => setShowSkillsModal(true)} style={{marginLeft: 'auto', padding: '4px 12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer', fontSize: '12px'}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: 'inline', marginRight: '4px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
            </h3>
            <div className="skills-list">
              {skills.length === 0 ? (
                <p style={{color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px'}}>No skills added yet. Click Edit to add.</p>
              ) : (
                skills.map((skill, idx) => (
                  <div key={idx} className="skill-item">
                    <span>{skill.name}</span>
                    <div className="skill-bar"><div style={{width: `${skill.percent}%`, backgroundColor: skill.color}}></div></div>
                    <span>{skill.percent}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {showSkillsModal && (
            <div className="modal-overlay" onClick={() => setShowSkillsModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Edit Skills</h2>
                  <button className="close-btn" onClick={() => setShowSkillsModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div style={{marginBottom: '20px'}}>
                    <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Current Skills</h3>
                    {skills.length === 0 && <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>No skills added yet.</p>}
                    {skills.map((skill, idx) => (
                      <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                        <div style={{width:'10px',height:'10px',borderRadius:'50%',background:skill.color,flexShrink:0}}></div>
                        <span style={{flex: 1, fontSize:'14px'}}>{skill.name}</span>
                        <span style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',width:'36px',textAlign:'right'}}>{skill.percent}%</span>
                        <button onClick={() => handleRemoveSkill(idx)} style={{padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontSize: '12px'}}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <h3 style={{fontSize: '15px', marginBottom: '12px'}}>Add Skill</h3>
                  <div className="form-group">
                    <label>Select from common skills or type your own</label>
                    <select
                      value={newSkill.name}
                      onChange={e => setNewSkill({...newSkill, name: e.target.value === '__custom__' ? '' : e.target.value})}
                      style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'white',fontSize:'14px',marginBottom:'8px'}}
                    >
                      <option value="">-- Select a skill --</option>
                      {['JavaScript','Python','Java','C++','C','React','Node.js','Express.js','MongoDB','MySQL','PostgreSQL','HTML/CSS','TypeScript','PHP','Ruby','Swift','Kotlin','Flutter','React Native','Django','Spring Boot','Docker','Kubernetes','AWS','Azure','Git','Linux','Machine Learning','Deep Learning','Data Science','SQL','REST APIs','GraphQL','Firebase','TensorFlow','PyTorch'].map(s => (
                        <option key={s} value={s} style={{background:'#0B0F19'}}>{s}</option>
                      ))}
                      <option value="__custom__" style={{background:'#0B0F19'}}>+ Enter custom skill...</option>
                    </select>
                    {(newSkill.name === '' || !['JavaScript','Python','Java','C++','C','React','Node.js','Express.js','MongoDB','MySQL','PostgreSQL','HTML/CSS','TypeScript','PHP','Ruby','Swift','Kotlin','Flutter','React Native','Django','Spring Boot','Docker','Kubernetes','AWS','Azure','Git','Linux','Machine Learning','Deep Learning','Data Science','SQL','REST APIs','GraphQL','Firebase','TensorFlow','PyTorch'].includes(newSkill.name)) && (
                      <input
                        type="text"
                        value={newSkill.name}
                        onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                        placeholder="Type skill name..."
                        style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',color:'white',fontSize:'14px'}}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Proficiency: {newSkill.percent}%</label>
                    <input type="range" min="0" max="100" value={newSkill.percent} onChange={(e) => setNewSkill({...newSkill, percent: parseInt(e.target.value)})} style={{width: '100%', cursor: 'pointer'}} />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <div style={{display: 'flex', gap: '8px'}}>
                      {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'].map(color => (
                        <button key={color} onClick={() => setNewSkill({...newSkill, color})} style={{width: '36px', height: '36px', background: color, border: newSkill.color === color ? '3px solid white' : '2px solid transparent', borderRadius: '8px', cursor: 'pointer'}}></button>
                      ))}
                    </div>
                  </div>
                  <button className="save-changes-btn" onClick={handleAddSkill}>Add Skill</button>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h3>Documents</h3>
            <div className="documents-list">
              <label htmlFor="resume-upload" className="doc-btn" style={{cursor: 'pointer'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {resume ? resume.name : 'Upload Resume / CV'}
                <input id="resume-upload" type="file" accept=".pdf" onChange={handleResumeUpload} style={{display: 'none'}} />
              </label>
              <button className="doc-btn" onClick={() => setShowIdCard(true)} style={{borderColor:'rgba(59,130,246,0.3)',color:'#60a5fa'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                Download ID Card
              </button>
              <button className="doc-btn" onClick={() => setShowMarksheetModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Marksheet
              </button>
            </div>
            {/* Only show semesters up to and including current semester */}
            {(() => {
              const currentSem = parseInt(profileData.semester) || 1;
              return (
                <div style={{marginTop: '20px'}}>
                  <h4 style={{fontSize: '14px', marginBottom: '12px', color: 'rgba(255,255,255,0.8)'}}>Marksheets</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {Array.from({length: currentSem}, (_, i) => i + 1).map(sem => (
                      <div key={sem} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '13px'}}>
                        <span>Semester {sem}</span>
                        {marksheets[sem] ? (
                          <span style={{color:'#4ade80',fontSize:'12px'}}>✓ Uploaded</span>
                        ) : (
                          <button
                            onClick={() => setShowMarksheetModal(true)}
                            style={{padding:'3px 10px',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'6px',color:'#60a5fa',cursor:'pointer',fontSize:'11px'}}
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {showMarksheetModal && (
        <div className="modal-overlay" onClick={() => setShowMarksheetModal(false)}>
          <div className="modal-content" style={{maxWidth: '900px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Marksheet</h2>
              <button className="close-btn" onClick={() => setShowMarksheetModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
                {['manual','ai'].map(t => (
                  <button key={t} onClick={() => setMarksheetTab(t)} style={{padding:'9px 20px',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'13px',background:marksheetTab===t?'linear-gradient(135deg,#3b82f6,#2563eb)':'rgba(255,255,255,0.05)',color:marksheetTab===t?'white':'rgba(255,255,255,0.6)'}}>
                    {t === 'manual' ? '✏️ Manual Entry' : '🤖 AI Extract (Docling)'}
                  </button>
                ))}
              </div>
              {marksheetTab === 'ai' ? (
                <AIMarksheetUpload onDataExtracted={(data) => {
                  showToastMsg(`Extracted: ${data.subjects?.length || 0} subjects, SGPA ${data.sgpa}`);
                  setShowMarksheetModal(false);
                }} />
              ) : (
              <MarksheetUpload currentSemesterOverride={profileData.semester} onDataExtracted={(data) => {
                showToastMsg(`Semester ${data.semester} SGPA: ${data.sgpa} saved!`);
                // Refresh marksheets display from localStorage
                const sid = student.student_id;
                const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
                const profile = profiles[sid] || {};
                const ms = {};
                Object.entries(profile.semesterData || {}).forEach(([sem, subs]) => {
                  if (subs && subs.length > 0) ms[parseInt(sem)] = { semester: parseInt(sem), subjects: subs };
                });
                setMarksheets(ms);
                setShowMarksheetModal(false);
              }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const [filter, setFilter] = useState('Pending');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  const payments = [
    { id: 1, title: 'Hostel Fee', semester: '2025-26 · Semester 5', amount: 25000, due: 'Due 15 Mar 2026', status: 'pending', transactionId: null },
    { id: 2, title: 'Library Fee', semester: '2025-26 · Semester 5', amount: 2000, due: 'Due 31 Mar 2026', status: 'pending', transactionId: null },
    { id: 3, title: 'Tuition Fee', semester: '2025-26 · Semester 5', amount: 45000, due: 'Paid 10 Jan 2026', status: 'paid', transactionId: 'TXN123456789', paidDate: '10 Jan 2026' },
    { id: 4, title: 'Lab Fee', semester: '2025-26 · Semester 5', amount: 8000, due: 'Paid 10 Jan 2026', status: 'paid', transactionId: 'TXN987654321', paidDate: '10 Jan 2026' },
    { id: 5, title: 'Sports Fee', semester: '2025-26 · Semester 5', amount: 1500, due: 'Paid 10 Jan 2026', status: 'paid', transactionId: 'TXN456789123', paidDate: '10 Jan 2026' }
  ];

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  
  const filtered = payments.filter(p => filter === 'Pending' ? p.status === 'pending' : p.status === 'paid');
  
  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };
  
  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };
  
  const handleProcessPayment = () => {
    setShowPaymentModal(false);
    toast('Payment processed successfully!');
  };

  const handleDownloadReceipt = async (payment) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const W = 148;
    doc.setFillColor(30, 58, 138); doc.rect(0, 0, W, 28, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text('Smart Campus', 10, 12);
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text('KDK College of Engineering', 10, 20);
    doc.text('PAYMENT RECEIPT', W - 10, 12, { align: 'right' });
    let y = 38;
    doc.setTextColor(30,30,30); doc.setFontSize(10);
    const row = (l, v) => { doc.setFont('helvetica','bold'); doc.text(l, 10, y); doc.setFont('helvetica','normal'); doc.text(String(v), 80, y); y += 8; };
    row('Student Name:', student.name || student.email?.split('@')[0] || 'Student');
    row('Student ID:', student.student_id || 'N/A');
    row('Payment Type:', payment.title);
    row('Semester:', payment.semester);
    row('Transaction ID:', payment.transactionId || 'N/A');
    row('Payment Date:', payment.paidDate || new Date().toLocaleDateString('en-IN'));
    doc.setDrawColor(200,200,200); doc.line(10, y, W - 10, y); y += 8;
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.text('Amount Paid:', 10, y); doc.setTextColor(22,163,74);
    doc.text(`Rs. ${payment.amount.toLocaleString()}`, 80, y);
    y += 14; doc.setTextColor(150,150,150); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text('This is a computer-generated receipt.', W / 2, y, { align: 'center' });
    doc.save(`receipt_${payment.title.replace(/\s+/g,'_')}.pdf`);
    toast('Receipt downloaded!');
  };

  return (
    <div className="payments-content">
      <div className="payments-header">
        <div>
          <h2>Fee Management</h2>
          <p>Track and manage your fee payments</p>
        </div>
      </div>
      <div className="payment-summary">
        <div className="summary-card pending">
          <div className="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3>₹{totalPending.toLocaleString()}</h3>
          <p>Total Pending</p>
        </div>
        <div className="summary-card paid">
          <div className="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3>₹{totalPaid.toLocaleString()}</h3>
          <p>Total Paid</p>
        </div>
        <div className="summary-card dues">
          <div className="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h3>{pendingCount}</h3>
          <p>Pending Dues</p>
        </div>
      </div>
      <div className="payment-filters">
        <button className={filter === 'Pending' ? 'active' : ''} onClick={() => setFilter('Pending')}>Pending ({pendingCount})</button>
        <button className={filter === 'Paid' ? 'active' : ''} onClick={() => setFilter('Paid')}>Paid ({paidCount})</button>
      </div>
      <div className="payments-list">
        {filtered.map(payment => (
          <div key={payment.id} className="payment-item">
            <div className="payment-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div className="payment-details">
              <h3>{payment.title}</h3>
              <p>{payment.semester}</p>
            </div>
            <div className="payment-amount">
              <h3>₹{payment.amount.toLocaleString()}</h3>
              <p className="payment-due">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {payment.due}
              </p>
            </div>
            {payment.status === 'pending' ? (
              <button className="pay-now-btn" onClick={() => handlePayNow(payment)}>Pay Now</button>
            ) : (
              <button className="view-receipt-btn" onClick={() => handleViewReceipt(payment)}>View Receipt</button>
            )}
          </div>
        ))}
      </div>
      
      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Gateway</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="payment-summary-header">
                  <div className="payment-icon-large">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <h3>{selectedPayment.title}</h3>
                    <p>{selectedPayment.semester}</p>
                  </div>
                </div>
                <div className="payment-amount-display">
                  <span>Total Amount</span>
                  <strong>₹{selectedPayment.amount.toLocaleString()}</strong>
                </div>
              </div>
              <div className="payment-methods">
                <h4>Payment Method</h4>
                <div className="payment-method-options">
                  <label className="payment-option selected">
                    <input type="radio" name="payment" value="upi" checked readOnly />
                    <div className="payment-option-content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#60a5fa">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>UPI Payment</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Enter UPI ID</label>
                <input type="text" placeholder="yourname@paytm" />
              </div>
              <button className="save-changes-btn" onClick={handleProcessPayment}>Pay ₹{selectedPayment.amount.toLocaleString()}</button>
            </div>
          </div>
        </div>
      )}
      
      {showReceipt && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceipt(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-content">
                <div className="receipt-header">
                  <h3>Smart Campus</h3>
                  <p>KDK College of Engineering</p>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-details">
                  <div className="receipt-row">
                    <span>Student Name:</span>
                    <strong>{student.name || student.email?.split('@')[0] || 'Student'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Student ID:</span>
                    <strong>{student.student_id || 'N/A'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Type:</span>
                    <strong>{selectedPayment.title}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Semester:</span>
                    <strong>{selectedPayment.semester}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction ID:</span>
                    <strong>{selectedPayment.transactionId}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Date:</span>
                    <strong>{selectedPayment.paidDate}</strong>
                  </div>
                  <div className="receipt-divider"></div>
                  <div className="receipt-row receipt-total">
                    <span>Amount Paid:</span>
                    <strong>₹{selectedPayment.amount.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="receipt-footer">
                  <p>This is a computer-generated receipt</p>
                </div>
              </div>
              <button className="save-changes-btn" onClick={() => handleDownloadReceipt(selectedPayment)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClubsContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const [filter, setFilter] = useState('All');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [joinStep, setJoinStep] = useState('payment');
  const [joinedClubs, setJoinedClubs] = useState(() => {
    const saved = localStorage.getItem(`joinedClubs_${student.student_id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptClub, setReceiptClub] = useState(null);
  const defaultClubs = [
    { id: 1, name: 'NSS - National Service Scheme', desc: 'Community service, blood donation drives, cleanliness campaigns, and rural outreach programs.', members: 334, category: 'Social', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: '#10b981' },
    { id: 2, name: 'Coding Club', desc: 'Weekly coding challenges, competitive programming, and project building. Open to all branches.', members: 245, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6' },
    { id: 3, name: 'Music Club', desc: 'Instrumental and vocal training, jam sessions, and performances at college events.', members: 203, category: 'Cultural', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: '#ec4899' },
    { id: 4, name: 'Entrepreneurship Cell', desc: 'Startup ideas to reality. Mentorship programs, investor connections, and pitch competitions.', members: 178, category: 'Academic', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: '#f59e0b' },
    { id: 5, name: 'Photography Club', desc: 'Capture campus life and memories. Monthly photo walks and workshops by professional photographers.', members: 156, category: 'Cultural', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', color: '#8b5cf6' },
    { id: 6, name: 'Debate & MUN Society', desc: 'Model United Nations, parliamentary debates, and public speaking workshops.', members: 134, category: 'Academic', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#06b6d4' },
    { id: 7, name: 'Drama & Theatre Club', desc: 'Perform in campus plays, street plays, and competitions. No prior experience needed!', members: 112, category: 'Cultural', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', color: '#f59e0b' },
    { id: 8, name: 'Robotics Society', desc: 'Build and program robots for national competitions. Annual RoboWars event organized by us.', members: 89, category: 'Technical', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', color: '#ef4444' }
  ];
  const [clubs, setClubs] = useState(defaultClubs);

  useEffect(() => {
    getClubs().then(data => { if (Array.isArray(data) && data.length > 0) setClubs(data); }).catch(() => {});
  }, []);

  const totalMembers = clubs.reduce((sum, club) => sum + club.members, 0);
  const technicalCount = clubs.filter(c => c.category === 'Technical').length;
  const culturalCount = clubs.filter(c => c.category === 'Cultural').length;
  
  const filtered = filter === 'All' ? clubs : clubs.filter(c => c.category === filter);
  
  const handleJoinClub = (club) => {
    setSelectedClub(club);
    setShowJoinModal(true);
    setJoinStep('payment');
  };

  const handlePaymentComplete = () => {
    setJoinStep('joining');
    setTimeout(() => {
      setJoinStep('success');
      const updated = [...joinedClubs, selectedClub.id];
      setJoinedClubs(updated);
      localStorage.setItem(`joinedClubs_${student.student_id}`, JSON.stringify(updated));
      
      const updatedClubs = clubs.map(c => 
        c.id === selectedClub.id ? {...c, members: c.members + 1} : c
      );
      setClubs(updatedClubs);
    }, 2000);
  };

  const handleWhatsAppJoin = () => {
    if (selectedClub?.whatsapp) {
      window.open(selectedClub.whatsapp, '_blank');
    }
  };

  const handleViewReceipt = (club) => {
    setReceiptClub(club);
    setShowReceipt(true);
  };

  return (
    <div className="clubs-content">
      <div className="clubs-header">
        <div>
          <h2>Campus Clubs</h2>
          <p>{clubs.length} active clubs · {totalMembers.toLocaleString()} total members</p>
        </div>
      </div>
      <div className="clubs-stats">
        <div className="club-stat">
          <h3>{clubs.length}</h3>
          <p>Total Clubs</p>
        </div>
        <div className="club-stat">
          <h3>{totalMembers.toLocaleString()}</h3>
          <p>Members</p>
        </div>
        <div className="club-stat">
          <h3>{technicalCount}</h3>
          <p>Technical</p>
        </div>
        <div className="club-stat">
          <h3>{culturalCount}</h3>
          <p>Cultural</p>
        </div>
      </div>
      <div className="club-filters">
        <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
        <button className={filter === 'Social' ? 'active' : ''} onClick={() => setFilter('Social')}>Social</button>
        <button className={filter === 'Technical' ? 'active' : ''} onClick={() => setFilter('Technical')}>Technical</button>
        <button className={filter === 'Cultural' ? 'active' : ''} onClick={() => setFilter('Cultural')}>Cultural</button>
        <button className={filter === 'Academic' ? 'active' : ''} onClick={() => setFilter('Academic')}>Academic</button>
      </div>
      <div className="clubs-grid">
        {filtered.map(club => (
          <div key={club.id} className="club-card">
            <div className="club-card-header">
              <div className="club-icon" style={{backgroundColor: club.color + '20'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={club.color} strokeWidth="2">
                  <path d={club.icon}/>
                </svg>
              </div>
              <span className="club-category" style={{backgroundColor: club.color + '20', color: club.color}}>{club.category}</span>
            </div>
            <h3>{club.name}</h3>
            <p className="club-desc">{club.desc}</p>
            <div className="club-footer">
              <div className="club-members">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {club.members} members
              </div>
              {joinedClubs.includes(club.id) ? (
                <div style={{display: 'flex', gap: '8px'}}>
                  <button className="join-btn" style={{borderColor: '#10b981', color: '#10b981', background: 'rgba(16,185,129,0.1)', cursor: 'default'}} disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Joined
                  </button>
                  <button className="join-btn" style={{borderColor: club.color, color: club.color, background: 'rgba(59,130,246,0.1)'}} onClick={() => handleViewReceipt(club)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    </svg>
                    Receipt
                  </button>
                </div>
              ) : (
                <button className="join-btn" style={{borderColor: club.color, color: club.color}} onClick={() => handleJoinClub(club)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showJoinModal && selectedClub && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content join-modal" onClick={(e) => e.stopPropagation()}>
            {joinStep === 'payment' ? (
              <div>
                <div className="modal-header">
                  <h2>Join Club</h2>
                  <button className="close-btn" onClick={() => setShowJoinModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="club-payment-card">
                    <div className="club-payment-icon" style={{backgroundColor: selectedClub.color}}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d={selectedClub.icon}/>
                      </svg>
                    </div>
                    <h3>{selectedClub.name}</h3>
                    <p className="club-payment-desc">Annual Membership • {selectedClub.members}+ Members</p>
                    <div className="club-payment-price">
                      <span className="price-label">Membership Fee</span>
                      <span className="price-amount">₹500</span>
                      <span className="price-period">/year</span>
                    </div>
                  </div>
                  <div className="club-benefits">
                    <h4>What's Included:</h4>
                    <div className="benefit-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>Access to all club events</span>
                    </div>
                    <div className="benefit-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>WhatsApp group membership</span>
                    </div>
                    <div className="benefit-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>Exclusive workshops & resources</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@paytm" />
                  </div>
                  <button className="club-pay-btn" style={{background: selectedClub.color}} onClick={handlePaymentComplete}>
                    Pay ₹500 & Join Club
                  </button>
                </div>
              </div>
            ) : joinStep === 'joining' ? (
              <div className="join-animation">
                <div className="spinner-container">
                  <div className="spinner" style={{borderTopColor: selectedClub.color}}></div>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={selectedClub.color} strokeWidth="2" className="club-icon-anim">
                    <path d={selectedClub.icon}/>
                  </svg>
                </div>
                <h3>Joining {selectedClub.name}...</h3>
                <p>Please wait while we process your request</p>
              </div>
            ) : (
              <div className="join-success">
                <div className="success-checkmark">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" className="check-circle"/>
                    <path d="M8 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-path"/>
                  </svg>
                </div>
                <h2>Welcome to {selectedClub.name}!</h2>
                <p>You've successfully joined the club. Connect with {selectedClub.members}+ members on WhatsApp.</p>
                <button className="whatsapp-btn" onClick={handleWhatsAppJoin}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Join WhatsApp Group
                </button>
                <button className="close-modal-btn" onClick={() => { 
                  setShowJoinModal(false);
                }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showReceipt && receiptClub && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceipt(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-content">
                <div className="receipt-header">
                  <h3>Smart Campus</h3>
                  <p>KDK College of Engineering</p>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-details">
                  <div className="receipt-row">
                    <span>Student Name:</span>
                    <strong>{student.name || student.email?.split('@')[0] || 'Student'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Student ID:</span>
                    <strong>{student.student_id || 'N/A'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Club Name:</span>
                    <strong>{receiptClub.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Category:</span>
                    <strong>{receiptClub.category}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction ID:</span>
                    <strong>TXN{Date.now().toString().slice(-9)}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Date:</span>
                    <strong>{new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</strong>
                  </div>
                  <div className="receipt-divider"></div>
                  <div className="receipt-row receipt-total">
                    <span>Amount Paid:</span>
                    <strong>₹500</strong>
                  </div>
                </div>
                <div className="receipt-footer">
                  <p>This is a computer-generated receipt</p>
                </div>
              </div>
              <button className="save-changes-btn" onClick={async () => {
                const { jsPDF } = await import('jspdf');
                const doc = new jsPDF({ unit: 'mm', format: 'a5' });
                const W = 148;
                doc.setFillColor(30, 58, 138); doc.rect(0, 0, W, 28, 'F');
                doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
                doc.text('Smart Campus', 10, 12);
                doc.setFontSize(9); doc.setFont('helvetica','normal');
                doc.text('KDK College of Engineering', 10, 20);
                doc.text('CLUB MEMBERSHIP RECEIPT', W - 10, 12, { align: 'right' });
                let y = 38;
                doc.setTextColor(30,30,30); doc.setFontSize(10);
                const row = (l, v) => { doc.setFont('helvetica','bold'); doc.text(l, 10, y); doc.setFont('helvetica','normal'); doc.text(String(v), 80, y); y += 8; };
                row('Student Name:', student.name || student.email?.split('@')[0] || 'Student');
                row('Student ID:', student.student_id || 'N/A');
                row('Club Name:', receiptClub.name);
                row('Category:', receiptClub.category);
                row('Transaction ID:', `TXN${Date.now().toString().slice(-9)}`);
                row('Payment Date:', new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}));
                doc.setDrawColor(200,200,200); doc.line(10, y, W - 10, y); y += 8;
                doc.setFont('helvetica','bold'); doc.setFontSize(12);
                doc.text('Amount Paid:', 10, y); doc.setTextColor(22,163,74);
                doc.text('Rs. 500', 80, y);
                y += 14; doc.setTextColor(150,150,150); doc.setFontSize(8); doc.setFont('helvetica','normal');
                doc.text('This is a computer-generated receipt.', W / 2, y, { align: 'center' });
                doc.save(`club_receipt_${receiptClub.name.replace(/\s+/g,'_')}.pdf`);
                toast('Receipt downloaded!');
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const API_BASE_MSG = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function MessagesContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const senderName = student.name || student.email?.split('@')[0] || 'Student';
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const lastMsgRef = useRef(null);
  const pollRef = useRef(null);
  const sinceRef = useRef(null);

  const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  // Load rooms
  useEffect(() => {
    fetch(`${API_BASE_MSG}/messages/rooms`, { headers: authH() })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setRooms(data); }).catch(() => {});
  }, []);

  // Load messages + start polling when room changes
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedRoom) return;
    sinceRef.current = null;
    setMessages([]);

    const fetchMsgs = (since) =>
      fetch(`${API_BASE_MSG}/messages/${selectedRoom}${since ? `?since=${since}` : ''}`, { headers: authH() })
        .then(r => r.json()).then(data => {
          if (!Array.isArray(data) || data.length === 0) return;
          setMessages(prev => {
            const ids = new Set(prev.map(m => m._id));
            const newMsgs = data.filter(m => !ids.has(m._id));
            return [...prev, ...newMsgs];
          });
          sinceRef.current = data[data.length - 1].created_at;
        }).catch(() => {});

    fetchMsgs(null);
    pollRef.current = setInterval(() => fetchMsgs(sinceRef.current), 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedRoom]);

  // Auto-scroll to bottom
  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedRoom || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_MSG}/messages/${selectedRoom}`, {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ text: messageText.trim(), sender_name: senderName })
      });
      const msg = await res.json();
      if (msg._id) setMessages(prev => [...prev, msg]);
      setMessageText('');
    } catch {}
    setSending(false);
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const currentRoom = rooms.find(r => r.room_id === selectedRoom);

  return (
    <div className="messages-content-whatsapp">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header"><h2>Messages</h2></div>
        <div className="chats-list">
          {rooms.length === 0 && <p style={{color:'rgba(255,255,255,0.3)',padding:'20px',fontSize:'13px'}}>No rooms available</p>}
          {rooms.map(room => (
            <div key={room.room_id} className={`chat-item ${selectedRoom === room.room_id ? 'active' : ''}`} onClick={() => setSelectedRoom(room.room_id)}>
              <div className="chat-avatar">{room.name[0].toUpperCase()}</div>
              <div className="chat-info">
                <div className="chat-header">
                  <h3>{room.name}</h3>
                  <span className="chat-time">{formatTime(room.lastTime)}</span>
                </div>
                <p className="chat-last-msg">{room.lastMsg || 'No messages yet'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedRoom ? (
          <>
            <div className="chat-main-header">
              <div className="chat-avatar">{currentRoom?.name[0].toUpperCase()}</div>
              <div>
                <h3>{currentRoom?.name}</h3>
                <p>{currentRoom?.type === 'group' ? 'Group Chat' : 'Personal'}</p>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === student.student_id || msg.sender_name === senderName;
                return (
                  <div key={msg._id || idx} className={`chat-message ${isMine ? 'mine' : ''}`}>
                    {!isMine && <span className="message-sender">{msg.sender_name}</span>}
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={lastMsgRef} />
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type a message..." value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={sending}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
}

function EventsContent() {
  const [filter, setFilter] = useState('All');
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    const saved = localStorage.getItem('registeredEvents');
    return saved ? JSON.parse(saved) : [];
  });
  const [eventCounts, setEventCounts] = useState(() => {
    const saved = localStorage.getItem('eventCounts');
    return saved ? JSON.parse(saved) : {};
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then(apiEvents => {
      if (Array.isArray(apiEvents)) setEvents(apiEvents);
    }).catch(() => {});
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);


  const handleRegister = async (eventKey) => {
    if (!registeredEvents.includes(eventKey)) {
      const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
      const newRegistered = [...registeredEvents, eventKey];
      const newCounts = {...eventCounts, [eventKey]: (eventCounts[eventKey] || 0) + 1};
      setRegisteredEvents(newRegistered);
      setEventCounts(newCounts);
      localStorage.setItem('registeredEvents', JSON.stringify(newRegistered));
      localStorage.setItem('eventCounts', JSON.stringify(newCounts));
      
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/events/${eventKey}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            student_id: student.student_id,
            email: student.email,
            phone: student.phone || 'N/A',
            name: student.name || student.email?.split('@')[0] || 'Student',
            department: student.department || 'N/A'
          })
        });
      } catch (err) {}
    }
  };

  const getRegisteredCount = (event) => {
    if (typeof event.registered !== 'string' || !event.registered.includes('/')) {
      const count = (event.registered_count || 0) + (eventCounts[event._id || event.id] || 0);
      const cap = event.capacity || 100;
      return `${count}/${cap}`;
    }
    const [current, total] = event.registered.split('/');
    const newCurrent = parseInt(current) + (eventCounts[event.id] || 0);
    return `${newCurrent}/${total}`;
  };

  const getPercent = (event) => {
    if (typeof event.registered !== 'string' || !event.registered.includes('/')) {
      const count = (event.registered_count || 0) + (eventCounts[event._id || event.id] || 0);
      const cap = event.capacity || 100;
      return Math.round((count / cap) * 100);
    }
    const [current, total] = event.registered.split('/');
    const newCurrent = parseInt(current) + (eventCounts[event.id] || 0);
    return Math.round((newCurrent / parseInt(total)) * 100);
  };

  return (
    <div className="events-content">
      <div className="events-header">
        <div>
          <h2>All Events</h2>
          <p>{events.length} events scheduled</p>
        </div>
      </div>
      <div className="event-filters">
        <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
        <button className={filter === 'Workshop' ? 'active' : ''} onClick={() => setFilter('Workshop')}>Workshop</button>
        <button className={filter === 'Seminar' ? 'active' : ''} onClick={() => setFilter('Seminar')}>Seminar</button>
        <button className={filter === 'Placement' ? 'active' : ''} onClick={() => setFilter('Placement')}>Placement</button>
        <button className={filter === 'Technical' ? 'active' : ''} onClick={() => setFilter('Technical')}>Technical</button>
        <button className={filter === 'Sports' ? 'active' : ''} onClick={() => setFilter('Sports')}>Sports</button>
        <button className={filter === 'Cultural' ? 'active' : ''} onClick={() => setFilter('Cultural')}>Cultural</button>
      </div>
      <div className="events-grid">
        {filtered.map(event => {
          const eventKey = event._id || event.id;
          return (
          <div key={eventKey} className="event-card" style={{borderColor: event.color + '40'}}>
            <div className="event-card-header">
              <span className="event-type" style={{backgroundColor: event.color + '30', color: event.color}}>{event.type}</span>
              <span className="days-left">{event.daysLeft} days left</span>
            </div>
            <h3>{event.title}</h3>
            <p className="event-desc">{event.desc}</p>
            <div className="event-details">
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {event.date}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {event.time}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {event.location}</div>
            </div>
            <div className="event-registration">
              <div className="reg-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>{getRegisteredCount(event)} registered</span>
                <span className="reg-percent">{getPercent(event)}% full</span>
              </div>
              <div className="reg-progress">
                <div className="reg-bar" style={{width: getPercent(event) + '%', backgroundColor: getPercent(event) > 90 ? '#ef4444' : getPercent(event) > 70 ? '#f59e0b' : '#3b82f6'}}></div>
              </div>
            </div>
            <button className="register-btn" style={{borderColor: event.color, color: event.color, ...(registeredEvents.includes(eventKey) && {background: event.color, color: 'white'})}} onClick={() => handleRegister(eventKey)} disabled={registeredEvents.includes(eventKey)}>
              {registeredEvents.includes(eventKey) ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Registered
                </>
              ) : 'Register Now'}
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function MeritListContent() {
  const students = [
    { rank: 1, name: 'Sneha Patel', id: 'IT2021001', dept: 'Information Technology', subject: 'Web Technologies', marks: '95/100', percent: '95%', grade: 'O', medal: 'gold' },
    { rank: 2, name: 'Rahul Sharma', id: 'CSE2021001', dept: 'Computer Science', subject: 'Data Structures', marks: '92/100', percent: '92%', grade: 'O', medal: 'silver' },
    { rank: 3, name: 'Ananya Reddy', id: 'ECE2021001', dept: 'Electronics', subject: 'Digital Circuits', marks: '91/100', percent: '91%', grade: 'O', medal: 'bronze' },
    { rank: 4, name: 'Arjun Mehta', id: 'IT2021045', dept: 'Information Technology', subject: 'Web Technologies', marks: '89/100', percent: '89%', grade: 'A+' },
    { rank: 5, name: 'Priya Singh', id: 'CSE2021002', dept: 'Computer Science', subject: 'Data Structures', marks: '88/100', percent: '88%', grade: 'A+' },
    { rank: 6, name: 'Demo Student', id: 'STU2024001', dept: 'Computer Science', subject: 'Data Structures', marks: '87/100', percent: '87%', grade: 'A+' },
    { rank: 7, name: 'Amit Kumar', id: 'CSE2021003', dept: 'Computer Science', subject: 'Data Structures', marks: '85/100', percent: '85%', grade: 'A' },
    { rank: 8, name: 'Kavya Nair', id: 'CSE2021004', dept: 'Computer Science', subject: 'Data Structures', marks: '82/100', percent: '82%', grade: 'A' },
    { rank: 9, name: 'Rohan Gupta', id: 'IT2021002', dept: 'Information Technology', subject: 'Web Technologies', marks: '78/100', percent: '78%', grade: 'B+' },
    { rank: 10, name: 'Vikram Joshi', id: 'ME2021001', dept: 'Mechanical', subject: 'Thermodynamics', marks: '76/100', percent: '76%', grade: 'B+' },
    { rank: 11, name: 'Divya Sharma', id: 'ECE2021002', dept: 'Electronics', subject: 'Digital Circuits', marks: '73/100', percent: '73%', grade: 'B' }
  ];

  return (
    <div className="merit-list-content">
      <div className="merit-header">
        <div>
          <h2>Merit List</h2>
          <p>{students.length} students</p>
        </div>
        <button className="export-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Excel
        </button>
      </div>
      <div className="merit-filters">
        <input type="text" placeholder="Search by name or enrollment..." className="merit-search" />
        <select className="merit-select"><option>All Departments</option></select>
        <select className="merit-select"><option>All Semesters</option></select>
        <button className="sort-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
          Highest First
        </button>
      </div>
      <div className="top-performers">
        {students.slice(0, 3).map(student => (
          <div key={student.rank} className="performer-card">
            <div className="medal-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill={student.medal === 'gold' ? '#fbbf24' : student.medal === 'silver' ? '#9ca3af' : '#3b82f6'}>
                <circle cx="12" cy="8" r="6"/><path d="M15.5 2L12 8l3.5 2L18 4z"/><path d="M8.5 2L12 8 8.5 10 6 4z"/>
              </svg>
            </div>
            <h3>{student.name}</h3>
            <p>{student.id}</p>
            <div className="performer-score">{student.percent}</div>
            <div className="performer-grade">{student.grade}</div>
          </div>
        ))}
      </div>
      <div className="merit-table-container">
        <table className="merit-table">
          <thead>
            <tr>
              <th>#</th>
              <th>STUDENT</th>
              <th>DEPARTMENT</th>
              <th>SUBJECT</th>
              <th>MARKS</th>
              <th>%</th>
              <th>GRADE</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.rank}>
                <td>{student.rank}</td>
                <td>
                  <div className="student-cell">
                    <strong>{student.name}</strong>
                    <span>{student.id}</span>
                  </div>
                </td>
                <td>{student.dept}</td>
                <td>{student.subject}</td>
                <td>{student.marks}</td>
                <td>{student.percent}</td>
                <td><span className={`grade-badge grade-${student.grade.replace('+', 'plus').toLowerCase()}`}>{student.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobsContent() {
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    const saved = localStorage.getItem(`appliedJobs_${student.student_id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs().then(data => { if (Array.isArray(data)) setJobs(data); }).catch(() => {});
  }, []);

  const handleViewDetails = (job) => { setSelectedJob(job); setShowDetailModal(true); };

  const handleApply = async (jobId) => {
    const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    if (!student.student_id) return;
    try { await applyForJob(jobId, student.student_id); } catch {}
    const updated = [...appliedJobs, jobId];
    setAppliedJobs(updated);
    localStorage.setItem(`appliedJobs_${student.student_id}`, JSON.stringify(updated));
  };

  return (
    <div className="internships-content">
      <div className="internships-header">
        <div>
          <h2>Job Placements</h2>
          <p>{jobs.length} placement{jobs.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>
      <div className="opportunities-grid">
        {jobs.length === 0 && <p style={{color:'rgba(255,255,255,0.4)',padding:'40px',textAlign:'center'}}>No job placements posted yet.</p>}
        {jobs.map(job => {
          const jid = job._id || job.id;
          return (
            <div key={jid} className="opportunity-card">
              <div className="opp-header">
                <div className="opp-logo" style={{backgroundColor: job.color}}>{job.logo}</div>
                <span className="opp-badge placement">Placement</span>
              </div>
              <h3>{job.role}</h3>
              <p className="opp-company">{job.company}</p>
              <div className="opp-details">
                <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {job.location}</div>
                <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {job.salary}</div>
                <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Deadline: {job.deadline}</div>
                {job.min_cgpa > 0 && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Min CGPA: {job.min_cgpa}</div>}
                {job.eligible_branches && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> {job.eligible_branches}</div>}
              </div>
              <button className="view-details-btn" onClick={() => handleViewDetails(job)}>
                {appliedJobs.includes(jid) ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Applied</>) : 'View Details'}
              </button>
            </div>
          );
        })}
      </div>
      {showDetailModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Job Details</h2><button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="job-detail-header">
                <div className="opp-logo" style={{backgroundColor:selectedJob.color,width:'64px',height:'64px',fontSize:'28px'}}>{selectedJob.logo}</div>
                <div>
                  <h3>{selectedJob.role}</h3>
                  <p style={{color:'rgba(255,255,255,0.7)',marginBottom:'8px'}}>{selectedJob.company}</p>
                  <span className="opp-badge placement">Placement</span>
                </div>
              </div>
              {selectedJob.description && <p style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',lineHeight:'1.6',margin:'16px 0',padding:'14px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)'}}>{selectedJob.description}</p>}
              <div className="job-detail-info">
                <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{selectedJob.location}</span></div>
                <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span>{selectedJob.salary}</span></div>
                <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Deadline: {selectedJob.deadline}</span></div>
                {selectedJob.min_cgpa > 0 && <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg><span>Minimum CGPA: {selectedJob.min_cgpa}</span></div>}
                {selectedJob.eligible_branches && <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><span>Eligible: {selectedJob.eligible_branches}</span></div>}
              </div>
              {(() => {
                const jid = selectedJob._id || selectedJob.id;
                const applied = appliedJobs.includes(jid);
                return <button className="save-changes-btn" style={{...(applied && {background:'#10b981'})}} onClick={() => handleApply(jid)} disabled={applied}>{applied ? (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Applied Successfully</>) : 'Apply Now'}</button>;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InternshipsContent() {
  const [filter, setFilter] = useState('All');
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    const saved = localStorage.getItem(`appliedJobs_${student.student_id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    getInternships().then(data => { if (Array.isArray(data)) setInternships(data); }).catch(() => {});
  }, []);

  const opportunities = internships;
  const filtered = opportunities;

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const handleApply = async (jobId) => {
    const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    if (!student.student_id) return;
    try {
      await applyForJob(jobId, student.student_id);
    } catch (err) {
      if (err?.message?.includes('Already applied')) { /* already applied, continue */ }
      else { console.error('Apply failed:', err); }
    }
    const updated = [...appliedJobs, jobId];
    setAppliedJobs(updated);
    localStorage.setItem(`appliedJobs_${student.student_id}`, JSON.stringify(updated));
  };

  return (
    <div className="internships-content">
      <div className="internships-header">
        <div>
          <h2>Internships</h2>
          <p>{internships.length} internship{internships.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>
      <div className="opportunities-grid">
        {internships.length === 0 && <p style={{color:'rgba(255,255,255,0.4)',padding:'40px',textAlign:'center'}}>No internships posted yet.</p>}
        {filtered.map(opp => {
          const oppId = opp._id || opp.id;
          return (
          <div key={oppId} className="opportunity-card">
            <div className="opp-header">
              <div className="opp-logo" style={{backgroundColor: opp.color}}>{opp.logo}</div>
              <span className={`opp-badge ${opp.type.toLowerCase()}`}>{opp.type}</span>
            </div>
            <h3>{opp.role}</h3>
            <p className="opp-company">{opp.company}</p>
            <div className="opp-details">
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {opp.location}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {opp.salary}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Deadline: {opp.deadline}</div>
              {opp.min_cgpa > 0 && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Min CGPA: {opp.min_cgpa}</div>}
              {opp.eligible_branches && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> {opp.eligible_branches}</div>}
            </div>
            <button className="view-details-btn" onClick={() => handleViewDetails(opp)}>
              {appliedJobs.includes(oppId) ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Applied</>
              ) : 'View Details'}
            </button>
          </div>
          );
        })}
      </div>
      
      {showDetailModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Job Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="job-detail-header">
                <div className="opp-logo" style={{backgroundColor: selectedJob.color, width: '64px', height: '64px', fontSize: '28px'}}>{selectedJob.logo}</div>
                <div>
                  <h3>{selectedJob.role}</h3>
                  <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '8px'}}>{selectedJob.company}</p>
                  <span className={`opp-badge ${selectedJob.type.toLowerCase()}`}>{selectedJob.type}</span>
                </div>
              </div>
              {selectedJob.description && (
                <p style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',lineHeight:'1.6',margin:'16px 0',padding:'14px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  {selectedJob.description}
                </p>
              )}
              <div className="job-detail-info">
                <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{selectedJob.location}</span></div>
                <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span>{selectedJob.salary}</span></div>
                <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Deadline: {selectedJob.deadline}</span></div>
                {selectedJob.min_cgpa > 0 && <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg><span>Minimum CGPA: {selectedJob.min_cgpa}</span></div>}
                {selectedJob.eligible_branches && <div className="info-row"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><span>Eligible: {selectedJob.eligible_branches}</span></div>}
              </div>
              {(() => {
                const jid = selectedJob._id || selectedJob.id;
                const applied = appliedJobs.includes(jid);
                return (
                  <button className="save-changes-btn" style={{...(applied && {background:'#10b981'})}} onClick={() => handleApply(jid)} disabled={applied}>
                    {applied ? (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Applied Successfully</>) : 'Apply Now'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function DashboardContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const studentName = student.name || student.email?.split('@')[0] || 'Student';
  const studentId = student.student_id || '';
  const semester = student.semester || '';
  const department = student.department || '';

  const [stats, setStats] = useState({jobs: 0, internships: 0, clubs: 0, events: 0});
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [currentSgpa, setCurrentSgpa] = useState(0);
  const [profileSemester, setProfileSemester] = useState(semester);

  const loadSgpa = () => {
    if (!studentId) return;
    // First read from localStorage for instant display
    const local = readSgpaFromStorage(studentId);
    if (local.currentSgpa > 0) {
      setCurrentSgpa(local.currentSgpa);
      setCgpa(local.cgpa);
      if (local.semester) setProfileSemester(local.semester);
    }
    // Then sync from API
    getStudentProfile(studentId).then(data => {
      if (!data) return;
      const sgpaList = data.sgpaList || [];
      const validSgpas = sgpaList.filter(v => v != null && v > 0);
      const apiSgpa = validSgpas.length > 0 ? validSgpas[validSgpas.length - 1] : 0;
      const apiCgpa = data.cgpa || 0;
      // Use whichever is more up-to-date (prefer local if API hasn't synced yet)
      setCurrentSgpa(prev => apiSgpa > 0 ? apiSgpa : prev);
      setCgpa(prev => apiCgpa > 0 ? apiCgpa : prev);
      setProfileSemester(data.semester || semester);
    }).catch(() => {});
  };

  useEffect(() => {
    Promise.all([getJobs(), getInternships(), getClubs(), getEvents()]).then(([j, i, c, e]) => {
      setStats({ jobs: (j||[]).length, internships: (i||[]).length, clubs: (c||[]).length, events: (e||[]).length });
      setJobs((j||[]).slice(0, 1));
      setClubs((c||[]).slice(0, 2));
      setEvents((e||[]).slice(0, 2));
    });
    loadSgpa();
    // Re-read SGPA whenever marksheet is saved (MarksheetUpload dispatches 'storage')
    window.addEventListener('storage', loadSgpa);
    return () => window.removeEventListener('storage', loadSgpa);
  }, []);

  const activities = [
    ...jobs.map(j => ({ text: `${j.company} job posted`, time: 'New', color: 'blue', link: 'jobs' })),
    ...events.map(e => ({ text: `${e.title}`, time: `${e.daysLeft} days left`, color: 'green', link: 'events' })),
    ...clubs.map(c => ({ text: `${c.name} - ${c.members} members`, time: 'Active', color: 'yellow', link: 'clubs' }))
  ].slice(0, 4);

  return (
    <div className="dashboard-content">
      <div className="greeting-card">
        <div>
          <p className="greeting">{getGreeting()},</p>
          <h1>{studentName}</h1>
          <p className="student-info">{department}{department && semester ? ' · ' : ''}{semester ? `Semester ${semester}` : ''}</p>
        </div>
        <div className="badge-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue" onClick={() => window.location.hash = 'jobs'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2>{stats.jobs}</h2>
          <p>Jobs Posted</p>
          <span className="stat-change">Available now</span>
        </div>
        <div className="stat-card teal" onClick={() => window.location.hash = 'internships'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h2>{stats.internships}</h2>
          <p>Internships</p>
          <span className="stat-change">Available now</span>
        </div>
        <div className="stat-card green" onClick={() => window.location.hash = 'clubs'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2>{stats.clubs}</h2>
          <p>Active Clubs</p>
          <span className="stat-change">{clubs.reduce((sum, c) => sum + c.members, 0)}+ members</span>
        </div>
        <div className="stat-card blue" onClick={() => window.location.hash = 'events'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2>{stats.events}</h2>
          <p>All Events</p>
          <span className="stat-change">{events.length > 0 ? `Next: ${events[0]?.date?.split(' ')[0] || 'Soon'}` : 'No events'}</span>
        </div>
      </div>

      <div className="bottom-section">
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {activities.length === 0 ? (
              <p style={{color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px'}}>No recent activity</p>
            ) : (
              activities.map((activity, idx) => (
                <div key={idx} className="activity-item" onClick={() => window.location.hash = activity.link} style={{cursor: 'pointer'}}>
                  <span className={`dot ${activity.color}`}></span>
                  <div>
                    <p>{activity.text}</p>
                    <span className={`time ${activity.color}`}>{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-access">
          <h3>Academic Performance</h3>
          <div className="cgpa-card">
            <div className="cgpa-header">
              <span>Current Semester SGPA</span>
              <span className="semester">Semester {profileSemester || semester}</span>
            </div>
            <h2>{currentSgpa.toFixed(2)} <span>/ 10.0</span></h2>
            <div className="progress-bar">
              <div className="progress" style={{width: `${(currentSgpa/10)*100}%`}}></div>
            </div>
            {cgpa > 0 && (
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginTop:'8px',textAlign:'center'}}>
                Overall CGPA: <strong style={{color:'#60a5fa'}}>{cgpa.toFixed(2)}</strong>
              </p>
            )}
            {currentSgpa === 0 && (
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',marginTop:'8px',textAlign:'center'}}>
                Upload marksheet to see your SGPA
              </p>
            )}
            {/* SGPA Trend Chart */}
            {(() => {
              const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
              const sgpaList = (profiles[studentId]?.sgpaList || []).filter(v => v != null && v > 0);
              if (sgpaList.length < 2) return null;
              const W = 260, H = 80, pad = 10;
              const maxV = Math.max(...sgpaList, 10);
              const pts = sgpaList.map((v, i) => [
                pad + (i / (sgpaList.length - 1)) * (W - pad * 2),
                H - pad - ((v / maxV) * (H - pad * 2))
              ]);
              const polyline = pts.map(p => p.join(',')).join(' ');
              const area = `${pts[0][0]},${H - pad} ` + polyline + ` ${pts[pts.length-1][0]},${H - pad}`;
              return (
                <div style={{marginTop:'14px'}}>
                  <p style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginBottom:'6px'}}>SGPA Trend</p>
                  <svg width={W} height={H} style={{overflow:'visible'}}>
                    <defs>
                      <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <polygon points={area} fill="url(#sgpaGrad)"/>
                    <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p[0]} cy={p[1]} r="3" fill="#3b82f6"/>
                        <text x={p[0]} y={p[1] - 7} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">{sgpaList[i].toFixed(1)}</text>
                        <text x={p[0]} y={H - 1} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">S{i+1}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
