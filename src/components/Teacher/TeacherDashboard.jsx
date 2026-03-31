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


function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const teacher = JSON.parse(localStorage.getItem('currentTeacher') || '{}');
  const teacherName = teacher.name || teacher.email?.split('@')[0] || 'Teacher';
  const teacherId = teacher.teacher_id || teacher.id || 'TCH2024001';
  const teacherDept = teacher.department || 'Computer Science Department';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['internships', 'events', 'clubs', 'merit', 'marksheets'].includes(hash)) {
      setActiveTab(hash);
    }
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
      case 'merit': return <MeritList />;
      case 'marksheets': return <TeacherMarksheetParser />;
      case 'profile': return <ProfileContent teacher={teacher} teacherName={teacherName} teacherId={teacherId} teacherDept={teacherDept} />;
      default: return <DashboardContent teacherName={teacherName} teacherId={teacherId} teacherDept={teacherDept} />;
    }
  };

  return (
    <div className="dashboard-layout teacher-dashboard-layout">
      <aside className="sidebar teacher-sidebar">
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
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg> Dashboard
          </button>
          <button className={activeTab === 'marksheets' ? 'active' : ''} onClick={() => setActiveTab('marksheets')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg> Marksheets
          </button>
          <button className={activeTab === 'merit' ? 'active' : ''} onClick={() => setActiveTab('merit')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg> Merit List
          </button>
          <button className={activeTab === 'internships' ? 'active' : ''} onClick={() => setActiveTab('internships')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg> Internships
          </button>
          <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg> Events
          </button>
          <button className={activeTab === 'clubs' ? 'active' : ''} onClick={() => setActiveTab('clubs')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg> Clubs
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg> Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{teacherName[0].toUpperCase()}</div>
            <div>
              <p className="user-name">{teacherName}</p>
              <p className="user-id">{teacherId}</p>
            </div>
          </div>
          <button className="signout-btn" onClick={() => { localStorage.removeItem('currentTeacher'); localStorage.removeItem('token'); navigate('/login'); }}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <h2 className="section-title">{getPageTitle()}</h2>
          <div className="header-right">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',padding:'8px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.8)',fontSize:'13px',fontWeight:'500',transition:'all 0.2s'}}
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

function ClubsContent() {
  const [filter, setFilter] = useState('All');
  const defaultClubs = [
        { id: 1, name: 'NSS - National Service Scheme', desc: 'Community service, blood donation drives, cleanliness campaigns, and rural outreach programs.', members: 334, category: 'Social', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: '#10b981' },
        { id: 2, name: 'Coding Club', desc: 'Weekly coding challenges, competitive programming, and project building. Open to all branches.', members: 245, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6' },
        { id: 3, name: 'Music Club', desc: 'Instrumental and vocal training, jam sessions, and performances at college events.', members: 203, category: 'Cultural', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: '#ec4899' },
        { id: 4, name: 'Entrepreneurship Cell', desc: 'Startup ideas to reality. Mentorship programs, investor connections, and pitch competitions.', members: 178, category: 'Academic', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: '#8b5cf6' },
        { id: 5, name: 'Photography Club', desc: 'Capture campus life and memories. Monthly photo walks and workshops by professional photographers.', members: 156, category: 'Cultural', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', color: '#8b5cf6' },
        { id: 6, name: 'Debate & MUN Society', desc: 'Model United Nations, parliamentary debates, and public speaking workshops.', members: 134, category: 'Academic', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#06b6d4' },
        { id: 7, name: 'Drama & Theatre Club', desc: 'Perform in campus plays, street plays, and competitions. No prior experience needed!', members: 112, category: 'Cultural', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', color: '#8b5cf6' },
        { id: 8, name: 'Robotics Society', desc: 'Build and program robots for national competitions. Annual RoboWars event organized by us.', members: 89, category: 'Technical', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', color: '#ef4444' }
  ];
  const [clubs, setClubs] = useState(defaultClubs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClub, setNewClub] = useState({name: '', desc: '', members: 0, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6', whatsapp: '', fee: 500, gpay: ''});

  useEffect(() => {
    getClubs().then(data => { if (Array.isArray(data) && data.length > 0) setClubs(data); }).catch(() => {});
  }, []);

  const totalMembers = clubs.reduce((sum, club) => sum + club.members, 0);
  const technicalCount = clubs.filter(c => c.category === 'Technical').length;
  const culturalCount = clubs.filter(c => c.category === 'Cultural').length;
  
  const filtered = filter === 'All' ? clubs : clubs.filter(c => c.category === filter);
  
  const handleRemoveClub = (clubId) => {
    deleteClub(clubId).catch(() => {});
    setClubs(prev => prev.filter(c => c.id !== clubId));
  };

  const handleDownloadList = (club) => {
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const joinedStudents = allStudents.filter(student => {
      const joined = JSON.parse(localStorage.getItem(`joinedClubs_${student.student_id}`) || '[]');
      return joined.includes(club.id);
    });
    
    let csv = `Club: ${club.name}\nCategory: ${club.category}\nTotal Members: ${joinedStudents.length}\nMembership Fee: ₹500\n\nMembers List:\nName,Email,Phone,Student ID,Payment Status,Transaction ID,Payment Date\n`;
    
    joinedStudents.forEach(student => {
      const name = student.email.split('@')[0];
      const txnId = `TXN${Date.now().toString().slice(-9)}`;
      const date = new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
      csv += `${name},${student.email},${student.phone || 'N/A'},${student.student_id},Paid,${txnId},${date}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${club.name.replace(/[^a-z0-9]/gi, '_')}_members.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddClub = () => {
    if (!newClub.name || !newClub.desc || !newClub.whatsapp || !newClub.gpay) {
      alert('Please fill all required fields');
      return;
    }
    addClub(newClub).then(saved => {
      setClubs(prev => [...prev, saved]);
      setShowAddModal(false);
      setNewClub({name: '', desc: '', members: 0, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6', whatsapp: '', fee: 500, gpay: ''});
    }).catch(() => alert('Failed to add club'));
  };

  return (
    <div className="clubs-content">
      <div className="clubs-header">
        <div>
          <h2>Campus Clubs</h2>
          <p>{clubs.length} active clubs · {totalMembers.toLocaleString()} total members</p>
        </div>
        <button className="export-btn" onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Club
        </button>
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
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="join-btn" style={{borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '6px 12px'}} onClick={() => handleDownloadList(club)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button className="join-btn" style={{borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.1)'}} onClick={() => handleRemoveClub(club.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Club</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Club Name *</label>
                <input type="text" value={newClub.name} onChange={(e) => setNewClub({...newClub, name: e.target.value})} placeholder="Chess Club" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={newClub.desc} onChange={(e) => setNewClub({...newClub, desc: e.target.value})} rows="3" placeholder="Brief description of the club..."></textarea>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={newClub.category} onChange={(e) => setNewClub({...newClub, category: e.target.value})} style={{width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '16px'}}>
                  <option style={{background: '#1a1d2e'}}>Social</option>
                  <option style={{background: '#1a1d2e'}}>Technical</option>
                  <option style={{background: '#1a1d2e'}}>Cultural</option>
                  <option style={{background: '#1a1d2e'}}>Academic</option>
                </select>
              </div>
              <div className="form-group">
                <label>Initial Members</label>
                <input type="number" value={newClub.members} onChange={(e) => setNewClub({...newClub, members: parseInt(e.target.value)})} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Membership Fee (₹) *</label>
                <input type="number" value={newClub.fee} onChange={(e) => setNewClub({...newClub, fee: parseInt(e.target.value)})} placeholder="500" />
              </div>
              <div className="form-group">
                <label>WhatsApp Group Link *</label>
                <input type="text" value={newClub.whatsapp} onChange={(e) => setNewClub({...newClub, whatsapp: e.target.value})} placeholder="https://chat.whatsapp.com/..." />
              </div>
              <div className="form-group">
                <label>GPay Number *</label>
                <input type="text" value={newClub.gpay} onChange={(e) => setNewClub({...newClub, gpay: e.target.value})} placeholder="9876543210" />
              </div>
              <button className="save-changes-btn" onClick={handleAddClub}>Add Club</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsContent() {
  const [filter, setFilter] = useState('All');
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'Workshop', title: '', desc: '', date: '', time: '', location: '', capacity: '100', daysLeft: 0
  });

  useEffect(() => {
    getEvents().then(data => { if (Array.isArray(data)) setEvents(data); }).catch(() => {});
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);

  const handleRemove = (event) => {
    const id = event.event_id || event.id;
    removeEvent(id).catch(() => {});
    setEvents(prev => prev.filter(e => (e.event_id || e.id) !== id));
  };

  const handleDownloadList = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      const res = await fetch(`${API}/db/event_registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allDocs = await res.json();
      const registeredStudents = allDocs.filter(d => d._docId?.startsWith(`${event.id}_`));

      if (registeredStudents.length === 0) {
        alert('No students have registered for this event yet.');
        return;
      }

      let csv = `Event: ${event.title}\nType: ${event.type}\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\nRegistered: ${registeredStudents.length}\n\nRegistered Students:\nName,Email,Phone,Student ID,Department\n`;
      registeredStudents.forEach(student => {
        csv += `${student.name},${student.email},${student.phone},${student.student_id},${student.department || 'N/A'}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading list:', err);
      alert('Error downloading list. Please try again.');
    }
  };

  const getEventColor = (type) => {
    const colors = {'Workshop': '#0d9488', 'Seminar': '#7c3aed', 'Placement': '#059669', 'Technical': '#1e40af', 'Sports': '#8b5cf6', 'Cultural': '#7e22ce'};
    return colors[type] || '#3b82f6';
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      alert('Please fill all required fields');
      return;
    }
    addEvent({ ...newEvent, registered: `0/${newEvent.capacity}`, color: getEventColor(newEvent.type), percent: 0 })
      .then(saved => {
        setEvents(prev => [...prev, saved]);
        setShowAddModal(false);
        setNewEvent({type: 'Workshop', title: '', desc: '', date: '', time: '', location: '', capacity: '100', daysLeft: 0});
      }).catch(() => alert('Failed to add event'));
  };

  const getRegisteredCount = (event) => event.registered || '0/100';
  const getPercent = (event) => event.percent || 0;

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
        <button className="export-btn" onClick={() => setShowAddModal(true)} style={{marginLeft: 'auto'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Event
        </button>
      </div>
      <div className="events-grid">
        {filtered.map(event => (
          <div key={event.id} className="event-card" style={{borderColor: event.color + '40'}}>
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
                <div className="reg-bar" style={{width: getPercent(event) + '%', backgroundColor: getPercent(event) > 90 ? '#ef4444' : getPercent(event) > 70 ? '#8b5cf6' : '#3b82f6'}}></div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="register-btn" style={{borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.1)', flex: 1}} onClick={() => handleRemove(event)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Remove
              </button>
              <button className="register-btn" style={{borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59,130,246,0.1)'}} onClick={() => handleDownloadList(event)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download List
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Event</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Type *</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})} style={{width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '16px'}}>
                  <option style={{background: '#1a1d2e'}}>Workshop</option>
                  <option style={{background: '#1a1d2e'}}>Seminar</option>
                  <option style={{background: '#1a1d2e'}}>Placement</option>
                  <option style={{background: '#1a1d2e'}}>Technical</option>
                  <option style={{background: '#1a1d2e'}}>Sports</option>
                  <option style={{background: '#1a1d2e'}}>Cultural</option>
                </select>
              </div>
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} placeholder="Workshop: AI & Machine Learning" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={newEvent.desc} onChange={(e) => setNewEvent({...newEvent, desc: e.target.value})} rows="3" placeholder="Brief description of the event..."></textarea>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="text" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} placeholder="25 February 2026" />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input type="text" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} placeholder="10:00 AM" />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} placeholder="Computer Lab 3, Block A" />
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input type="text" value={newEvent.capacity} onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})} placeholder="100" />
              </div>
              <div className="form-group">
                <label>Days Left</label>
                <input type="number" value={newEvent.daysLeft} onChange={(e) => setNewEvent({...newEvent, daysLeft: parseInt(e.target.value)})} placeholder="10" />
              </div>
              <button className="save-changes-btn" onClick={handleAddEvent}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InternshipsContent() {
  const [filter, setFilter] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    getJobs().then(data => { if (Array.isArray(data)) setJobs(data); }).catch(() => {});
    getInternships().then(data => { if (Array.isArray(data)) setInternships(data); }).catch(() => {});
  }, []);
  
  const opportunities = [...internships, ...jobs];
  const filtered = filter === 'All' ? opportunities : opportunities.filter(o => o.type === filter);

  return (
    <div className="internships-content">
      <div className="internships-header">
        <div>
          <h2>Internships & Placements</h2>
          <p>{opportunities.length} opportunities available</p>
        </div>
        <div className="filter-buttons">
          <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
          <button className={filter === 'Internship' ? 'active' : ''} onClick={() => setFilter('Internship')}>Internships</button>
          <button className={filter === 'Placement' ? 'active' : ''} onClick={() => setFilter('Placement')}>Placements</button>
        </div>
      </div>
      <div className="opportunities-grid">
        {filtered.map(opp => (
          <div key={opp.id} className="opportunity-card">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardContent({ teacherName, teacherId, teacherDept }) {
  const [stats, setStats] = useState({jobs: 0, internships: 0, clubs: 0, events: 0, students: 0});
  const [nextEvent, setNextEvent] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    Promise.all([getJobs(), getInternships(), getClubs(), getEvents()]).then(([j, i, c, e]) => {
      const clubs = Array.isArray(c) ? c : [];
      const events = Array.isArray(e) ? e : [];
      setStats({
        jobs: (Array.isArray(j) ? j : []).length,
        internships: (Array.isArray(i) ? i : []).length,
        clubs: clubs.length,
        events: events.length,
        students: JSON.parse(localStorage.getItem('students') || '[]').length
      });
      setNextEvent(events[0] || null);
      setTotalMembers(clubs.reduce((sum, c) => sum + (c.members || 0), 0));
    });
  }, []);
  
  return (
    <div className="dashboard-content">
      <div className="greeting-card teacher-greeting-card">
        <div>
          <p className="greeting">{getGreeting()},</p>
          <h1>{teacherName}</h1>
          <p className="student-info">{teacherDept} · Faculty ID: {teacherId}</p>
        </div>
        <div className="badge-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card teacher-stat-card blue" onClick={() => window.location.hash = 'internships'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2>{stats.jobs}</h2>
          <p>Jobs Posted</p>
          <span className="stat-change">Active postings</span>
        </div>
        <div className="stat-card teacher-stat-card blue" onClick={() => window.location.hash = 'internships'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h2>{stats.internships}</h2>
          <p>Internships</p>
          <span className="stat-change">Active postings</span>
        </div>
        <div className="stat-card teacher-stat-card blue" onClick={() => window.location.hash = 'clubs'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2>{stats.clubs}</h2>
          <p>Active Clubs</p>
          <span className="stat-change">{totalMembers}+ members</span>
        </div>
        <div className="stat-card teacher-stat-card orange" onClick={() => window.location.hash = 'events'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2>{stats.events}</h2>
          <p>All Events</p>
          <span className="stat-change">{nextEvent ? `Next: ${nextEvent.date?.split(' ')[0]}` : 'No events'}</span>
        </div>
      </div>

      <div className="bottom-section">
        <div className="activity-card">
          <h3>Overview</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="dot blue"></span>
              <div>
                <p>{stats.students} students registered</p>
                <span className="time blue">Total</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="dot green"></span>
              <div>
                <p>{stats.events} events scheduled</p>
                <span className="time green">Active</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="dot yellow"></span>
              <div>
                <p>{stats.clubs} clubs active</p>
                <span className="time yellow">{totalMembers}+ members</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="dot blue"></span>
              <div>
                <p>{stats.jobs + stats.internships} opportunities posted</p>
                <span className="time blue">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

function ProfileContent({ teacher, teacherName, teacherId, teacherDept }) {
  const [profileData, setProfileData] = useState({
    name: teacherName,
    teacher_id: teacherId,
    email: teacher.email || '',
    phone: '',
    department: teacherDept,
    designation: 'Assistant Professor',
    bio: '',
    subjects: '',
    experience: '',
    qualification: ''
  });
  const [formData, setFormData] = useState({ ...profileData });
  const [showEditModal, setShowEditModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    getTeacherProfile(teacherId).then(data => {
      if (data) {
        const merged = { ...profileData, ...data };
        setProfileData(merged);
        setFormData(merged);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [teacherId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) e.phone = 'Phone must be 10 digits';
    if (!formData.department) e.department = 'Department is required';
    if (!formData.designation) e.designation = 'Designation is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await saveTeacherProfile(teacherId, formData);
      setProfileData({ ...formData });
      // Update localStorage so sidebar reflects new name
      const stored = JSON.parse(localStorage.getItem('currentTeacher') || '{}');
      localStorage.setItem('currentTeacher', JSON.stringify({ ...stored, name: formData.name, department: formData.department }));
      setShowEditModal(false);
      showToast('Profile updated successfully');
    } catch {
      showToast('Failed to save profile');
    }
  };

  const sel = (f, v) => setFormData(p => ({ ...p, [f]: v }));

  const inputStyle = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '14px', fontFamily: 'Inter,sans-serif' };
  const errStyle = { color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' };
  const labelStyle = { fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="profile-content">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: '#3b0764', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', padding: '14px 20px', color: 'white', fontSize: '14px', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} value={formData.name} onChange={e => sel('name', e.target.value)} placeholder="Dr. Rajesh Kumar" />
                  {errors.name && <span style={errStyle}>{errors.name}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} type="tel" value={formData.phone} onChange={e => sel('phone', e.target.value)} placeholder="10-digit number" />
                  {errors.phone && <span style={errStyle}>{errors.phone}</span>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Department *</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.department} onChange={e => sel('department', e.target.value)}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d} style={{ background: '#0B0F19' }}>{d}</option>)}
                  </select>
                  {errors.department && <span style={errStyle}>{errors.department}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Designation *</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.designation} onChange={e => sel('designation', e.target.value)}>
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d} style={{ background: '#0B0F19' }}>{d}</option>)}
                  </select>
                  {errors.designation && <span style={errStyle}>{errors.designation}</span>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Qualification</label>
                  <input style={inputStyle} value={formData.qualification} onChange={e => sel('qualification', e.target.value)} placeholder="e.g. Ph.D, M.Tech" />
                </div>
                <div>
                  <label style={labelStyle}>Experience</label>
                  <input style={inputStyle} value={formData.experience} onChange={e => sel('experience', e.target.value)} placeholder="e.g. 8 years" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Subjects Taught</label>
                <input style={inputStyle} value={formData.subjects} onChange={e => sel('subjects', e.target.value)} placeholder="e.g. Data Structures, DBMS, OS" />
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={formData.bio} onChange={e => sel('bio', e.target.value)} placeholder="Brief description about yourself..." />
              </div>
              <button
                onClick={handleSave}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg,#4c1d95,#6d28d9)', borderRadius: '20px', padding: '32px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', border: '2px solid rgba(255,255,255,0.2)' }}>
            {profileData.name[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>{profileData.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>{profileData.designation} · {profileData.department}</p>
            <span style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '12px' }}>ID: {profileData.teacher_id}</span>
          </div>
        </div>
        <button
          onClick={() => { setFormData({ ...profileData }); setErrors({}); setShowEditModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Personal info */}
          <div className="profile-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Information
            </h3>
            <div className="info-grid">
              {[
                { icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, label: 'Full Name', value: profileData.name },
                { icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>, label: 'Email', value: profileData.email },
                { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>, label: 'Phone', value: profileData.phone ? `+91 ${profileData.phone}` : '—' },
                { icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>, label: 'Department', value: profileData.department },
                { icon: <path d="M12 2L2 7l10 5 10-5-10-5z"/>, label: 'Teacher ID', value: profileData.teacher_id },
                { icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, label: 'Experience', value: profileData.experience || '—' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                  <div><label>{label}</label><p>{value}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          {profileData.bio && (
            <div className="profile-section">
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>About</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>{profileData.bio}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Academic info */}
          <div className="profile-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Academic Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Designation', value: profileData.designation },
                { label: 'Qualification', value: profileData.qualification || '—' },
                { label: 'Subjects Taught', value: profileData.subjects || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '12px 14px', background: 'rgba(139,92,246,0.06)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-section">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Activity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Events Created', value: profileData.created_events?.length ?? 0, color: '#8b5cf6' },
                { label: 'Clubs Managed', value: profileData.created_clubs?.length ?? 0, color: '#a78bfa' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '20px 12px', background: 'rgba(139,92,246,0.08)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
