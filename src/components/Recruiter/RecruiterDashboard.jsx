import './RecruiterDashboard.css';
import '../../theme.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecruiterJobs, addJob, deleteJob, getApplicants, searchCandidates, updateApplicationStatus, getApplicantCounts } from '../../utils/jobsStore';
import { getRecruiterProfile, saveRecruiterProfile, getAllStudents } from '../../api/profiles';
import { toast } from '../Toast';

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

function ProfileContent({ cid, recruiter: currentUser }) {
  const [profile, setProfile] = useState({
    company: currentUser.company || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    website: currentUser.website || '',
    industry: currentUser.industry || '',
    description: ''
  });
  const [form, setForm] = useState({ ...profile });
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cid) { setLoading(false); return; }
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    Promise.all([
      getRecruiterProfile(cid).catch(() => null),
      fetch(`${API}/recruiter/team/${cid}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).catch(() => [])
    ]).then(([data, members]) => {
      if (data) { setProfile(p => ({ ...p, ...data })); setForm(p => ({ ...p, ...data })); }
      if (Array.isArray(members)) setTeam(members);
    }).finally(() => setLoading(false));
  }, [cid]);

  const showToast = (msg) => toast(msg);

  const handleSave = async () => {
    if (!form.company.trim()) { showToast('Company name is required'); return; }
    try {
      await saveRecruiterProfile(cid, form);
      setProfile({ ...form });
      const stored = JSON.parse(localStorage.getItem('currentRecruiter') || '{}');
      localStorage.setItem('currentRecruiter', JSON.stringify({ ...stored, company: form.company, industry: form.industry }));
      setShowEdit(false);
      showToast('Profile updated successfully');
    } catch { showToast('Failed to save profile'); }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inp = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '14px', fontFamily: 'Inter,sans-serif' };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="profile-content">
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Company Profile</h2><button className="close-btn" onClick={() => setShowEdit(false)}>×</button></div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Company Name *</label><input style={inp} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Phone</label><input style={inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit number" /></div>
                <div><label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Industry</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                    <option value="">Select Industry</option>
                    {['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Other'].map(i => <option key={i} value={i} style={{ background: '#0B0F19' }}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Website</label><input style={inp} value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://company.com" /></div>
              <div><label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Hiring Role</label><input style={inp} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Software Engineer" /></div>
              <div><label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Company Description</label><textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of your company..." /></div>
              <button className="save-changes-btn" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'linear-gradient(135deg, #c2410c, #ea580c)', borderRadius: '20px', padding: '32px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', border: '2px solid rgba(255,255,255,0.2)' }}>
            {profile.company?.[0]?.toUpperCase() || 'R'}
          </div>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>{profile.company || 'Company Name'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>{profile.industry || 'Industry'} · {currentUser.role || 'Recruiter'}</p>
            <span style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '12px' }}>ID: {currentUser.recruiter_id}</span>
          </div>
        </div>
        <button onClick={() => { setForm({ ...profile }); setShowEdit(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Profile
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="profile-section">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Company Information</h3>
          <div className="info-grid">
            {[
              { label: 'Company', value: profile.company },
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone || '—' },
              { label: 'Industry', value: profile.industry || '—' },
              { label: 'Website', value: profile.website || '—' },
              { label: 'Hiring For', value: profile.role || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="info-item">
                <div><label>{label}</label><p style={{ wordBreak: 'break-all' }}>{value}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="profile-section">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>About</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
            {profile.description || 'No description added yet. Click Edit Profile to add a company description.'}
          </p>
        </div>
      </div>

      {/* Company Code Card */}
      {currentUser.is_admin && (
        <div className="profile-section" style={{ marginTop: '24px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Company Code</h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>Share this code with your colleagues so they can join your company on Smart Campus.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <code style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '15px', fontFamily: 'monospace', color: '#fb923c', letterSpacing: '1px', border: '1px solid rgba(249,115,22,0.3)' }}>{cid}</code>
            <button onClick={handleCopyCode} style={{ padding: '12px 20px', background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)', border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(249,115,22,0.4)'}`, borderRadius: '10px', color: copied ? '#4ade80' : '#fb923c', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
      )}

      {/* Team Members */}
      {team.length > 0 && (
        <div className="profile-section" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Team Members ({team.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {team.map(member => (
              <div key={member.recruiter_id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                  {member.email?.[0]?.toUpperCase() || 'R'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{member.email}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{member.role || 'Recruiter'}</p>
                </div>
                {member.is_admin && (
                  <span style={{ padding: '3px 10px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '6px', fontSize: '11px', color: '#fb923c', fontWeight: '600' }}>Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicantsContent({ cid }) {
  const [filter, setFilter] = useState('All');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cid) { setLoading(false); return; }
    getApplicants(cid).then(async data => {
      if (!Array.isArray(data)) { setLoading(false); return; }
      const allStudents = await getAllStudents().catch(() => []);
      const studentMap = {};
      allStudents.forEach(s => { studentMap[s.student_id] = s; });
      const mapped = data.map((app, idx) => {
        const s = studentMap[app.student_id] || {};
        return {
          id: app._id || idx,
          student_id: app.student_id,
          name: s.name || app.student_id,
          email: s.email || '—',
          dept: s.department || '—',
          cgpa: s.cgpa ? s.cgpa.toFixed(2) : '—',
          skills: (s.skills || []).slice(0, 3).map(sk => sk.name).join(', ') || '—',
          position: app.job_id?.role || '—',
          type: app.job_id?.type || 'Placement',
          score: app.score || 0,
          status: app.status || 'pending'
        };
      });
      setApplicants(mapped.sort((a, b) => b.score - a.score));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [cid]);

  const handleStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch {}
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ['Rank','Name','Student ID','Email','Department','CGPA','Skills','Position','Score','Status'];
    const rows = filtered.map((a, i) => [
      i + 1, a.name, a.student_id, a.email, a.dept, a.cgpa, a.skills, a.position, a.score, a.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const STATUS_STYLES = {
    pending:   { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', label: 'Pending' },
    shortlisted: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Shortlisted' },
    interview: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Interview' },
    hired:     { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', label: 'Hired' },
    rejected:  { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', label: 'Rejected' },
  };

  const filtered = filter === 'All' ? applicants
    : filter === 'Internships' ? applicants.filter(a => a.type === 'Internship')
    : filter === 'Jobs' ? applicants.filter(a => a.type === 'Placement')
    : applicants.filter(a => a.status === filter.toLowerCase());

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading applicants...</div>;

  return (
    <div className="merit-list-content">
      <div className="merit-header">
        <div><h2>Applicants</h2><p>{filtered.length} applicant{filtered.length !== 1 ? 's' : ''} · sorted by match score</p></div>
        <button className="export-btn" onClick={handleExport} disabled={filtered.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {['All', 'Jobs', 'Internships', 'Shortlisted', 'Interview', 'Hired', 'Rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', background: filter === f ? '#f97316' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' }}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>No applicants found.</div>
      ) : (
        <div className="merit-table-container">
          <table className="merit-table">
            <thead><tr><th>#</th><th>Student</th><th>Email</th><th>Dept</th><th>CGPA</th><th>Skills</th><th>Position</th><th>Score</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((a, i) => {
                const st = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
                return (
                  <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td><div className="student-cell"><strong>{a.name}</strong><span>{a.student_id}</span></div></td>
                    <td style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{a.email}</td>
                    <td>{a.dept}</td>
                    <td>{a.cgpa}</td>
                    <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{a.skills}</td>
                    <td>{a.position}</td>
                    <td><span className="grade-badge" style={{ background: a.score >= 90 ? 'rgba(34,197,94,0.2)' : a.score >= 75 ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)', color: a.score >= 90 ? '#4ade80' : a.score >= 75 ? '#60a5fa' : '#fbbf24' }}>{a.score}</span></td>
                    <td><span style={{ padding: '3px 10px', background: st.bg, color: st.color, borderRadius: '6px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{st.label}</span></td>
                    <td>
                      <select
                        value={a.status}
                        onChange={e => handleStatus(a.id, e.target.value)}
                        style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <option value="pending" style={{background:'#0B0F19'}}>Pending</option>
                        <option value="shortlisted" style={{background:'#0B0F19'}}>Shortlist</option>
                        <option value="interview" style={{background:'#0B0F19'}}>Interview</option>
                        <option value="hired" style={{background:'#0B0F19'}}>Hire</option>
                        <option value="rejected" style={{background:'#0B0F19'}}>Reject</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CandidatesContent() {
  const [filters, setFilters] = useState({ search: '', dept: '', minCgpa: '', maxCgpa: '', skill: '', semester: '', year: '' });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const DEPARTMENTS = ['Computer Science & Engineering','Information Technology','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering'];
  const COMMON_SKILLS = ['JavaScript','Python','Java','React','Node.js','C++','Machine Learning','SQL','AWS','Docker','Flutter','Data Science'];

  const handleSearch = async () => {
    setLoading(true); setSearched(true);
    try {
      const params = {};
      if (filters.search)   params.search   = filters.search;
      if (filters.dept)     params.dept     = filters.dept;
      if (filters.minCgpa)  params.minCgpa  = filters.minCgpa;
      if (filters.skill)    params.skill    = filters.skill;
      if (filters.semester) params.semester = filters.semester;
      const data = await searchCandidates(params);
      let results = Array.isArray(data) ? data : [];
      // Client-side maxCgpa + year filter
      if (filters.maxCgpa) results = results.filter(c => !c.cgpa || c.cgpa <= parseFloat(filters.maxCgpa));
      if (filters.year)    results = results.filter(c => String(c.year) === filters.year);
      setCandidates(results);
    } catch { setCandidates([]); }
    setLoading(false);
  };

  const handleReset = () => {
    setFilters({ search: '', dept: '', minCgpa: '', maxCgpa: '', skill: '', semester: '', year: '' });
    setCandidates([]); setSearched(false);
  };

  const inp = { padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '14px', fontFamily: 'Inter,sans-serif', width: '100%' };
  const sel = { ...inp, cursor: 'pointer' };

  return (
    <div className="merit-list-content">
      <div className="merit-header"><div><h2>Find Candidates</h2><p>Filter students by skills, department, CGPA & more</p></div></div>

      {/* Filter panel */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Name / Student ID</label>
            <input style={inp} value={filters.search} onChange={e => setFilters(p => ({...p, search: e.target.value}))} placeholder="Search..." onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Department</label>
            <select style={sel} value={filters.dept} onChange={e => setFilters(p => ({...p, dept: e.target.value}))}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d} style={{background:'#0B0F19'}}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Skill</label>
            <select style={sel} value={filters.skill} onChange={e => setFilters(p => ({...p, skill: e.target.value}))}>
              <option value="">Any Skill</option>
              {COMMON_SKILLS.map(s => <option key={s} value={s} style={{background:'#0B0F19'}}>{s}</option>)}
              <option value="__custom__" style={{background:'#0B0F19'}}>Custom...</option>
            </select>
            {filters.skill === '__custom__' && (
              <input style={{...inp, marginTop:'6px'}} placeholder="Type skill..." onChange={e => setFilters(p => ({...p, skill: e.target.value}))} />
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '14px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Min CGPA</label>
            <input style={inp} type="number" min="0" max="10" step="0.1" value={filters.minCgpa} onChange={e => setFilters(p => ({...p, minCgpa: e.target.value}))} placeholder="e.g. 7.0" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Max CGPA</label>
            <input style={inp} type="number" min="0" max="10" step="0.1" value={filters.maxCgpa} onChange={e => setFilters(p => ({...p, maxCgpa: e.target.value}))} placeholder="e.g. 10.0" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Year</label>
            <select style={sel} value={filters.year} onChange={e => setFilters(p => ({...p, year: e.target.value}))}>
              <option value="">Any Year</option>
              {[1,2,3,4].map(y => <option key={y} value={y} style={{background:'#0B0F19'}}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Semester</label>
            <select style={sel} value={filters.semester} onChange={e => setFilters(p => ({...p, semester: e.target.value}))}>
              <option value="">Any Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} style={{background:'#0B0F19'}}>Sem {s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSearch} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>Search</button>
            <button onClick={handleReset} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px' }}>Reset</button>
          </div>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Searching...</div>}
      {!loading && searched && candidates.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No candidates found matching your criteria.</div>}
      {!loading && candidates.length > 0 && (
        <>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found</p>
          <div className="merit-table-container">
            <table className="merit-table">
              <thead><tr><th>#</th><th>Student</th><th>Email</th><th>Department</th><th>CGPA</th><th>Skills</th><th>Year / Sem</th><th>Action</th></tr></thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={c.student_id || i}>
                    <td>{i + 1}</td>
                    <td><div className="student-cell"><strong>{c.name || c.student_id}</strong><span>{c.student_id}</span></div></td>
                    <td style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{c.email}</td>
                    <td style={{ fontSize: '12px' }}>{c.department || '—'}</td>
                    <td><span style={{ color: c.cgpa >= 8 ? '#4ade80' : c.cgpa >= 6 ? '#60a5fa' : '#fbbf24', fontWeight: '600' }}>{c.cgpa ? c.cgpa.toFixed(2) : '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(c.skills || []).slice(0, 3).map(s => (
                          <span key={s.name} style={{ padding: '2px 8px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '6px', fontSize: '11px', color: '#fb923c' }}>{s.name}</span>
                        ))}
                        {(c.skills || []).length > 3 && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Y{c.year || '—'} / S{c.semester || '—'}</td>
                    <td>
                      <button onClick={() => setSelectedCandidate(c)} style={{ padding: '5px 12px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '6px', color: '#fb923c', cursor: 'pointer', fontSize: '12px' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Candidate detail modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Candidate Profile</h2><button className="close-btn" onClick={() => setSelectedCandidate(null)}>×</button></div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: 'rgba(249,115,22,0.06)', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.15)' }}>
                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 }}>
                  {(selectedCandidate.name || selectedCandidate.student_id || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>{selectedCandidate.name || selectedCandidate.student_id}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{selectedCandidate.student_id} · {selectedCandidate.department || 'N/A'}</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: selectedCandidate.cgpa >= 8 ? '#4ade80' : selectedCandidate.cgpa >= 6 ? '#60a5fa' : '#fbbf24' }}>{selectedCandidate.cgpa ? selectedCandidate.cgpa.toFixed(2) : '—'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>CGPA</div>
                </div>
              </div>
              {[['Email', selectedCandidate.email], ['Phone', selectedCandidate.phone ? `+91 ${selectedCandidate.phone}` : '—'], ['Year / Semester', `Year ${selectedCandidate.year || '—'} · Semester ${selectedCandidate.semester || '—'}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
              {(selectedCandidate.skills || []).length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedCandidate.skills.map(s => (
                      <span key={s.name} style={{ padding: '4px 12px', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '8px', fontSize: '13px', color: '#fb923c' }}>{s.name} · {s.percent}%</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobsContent({ cid }) {
  const recruiter = JSON.parse(localStorage.getItem('currentRecruiter') || '{}');
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({company: recruiter.company || '', role: '', location: '', salary: '', deadline: '', description: '', min_cgpa: '', eligible_branches: '', color: '#f97316'});

  useEffect(() => {
    if (!cid) return;
    getRecruiterJobs(cid).then(data => {
      if (Array.isArray(data)) setJobs(data.filter(j => j.type === 'Placement'));
    }).catch(() => {});
    getApplicantCounts(cid).then(data => setCounts(data || {})).catch(() => {});
  }, [cid]);

  const handleRemove = (jobId) => {
    if (!window.confirm('Remove this job posting? All applications will also be affected.')) return;
    deleteJob(jobId).then(() => setJobs(prev => prev.filter(j => (j._id || j.id) !== jobId))).catch(() => {});
  };

  const handleAddJob = () => {
    if (!newJob.company || !newJob.role || !newJob.location || !newJob.salary || !newJob.deadline) {
      alert('Please fill all required fields'); return;
    }
    addJob({...newJob, logo: newJob.company.charAt(0).toUpperCase(), type: 'Placement'}).then(job => {
      setJobs(prev => [...prev, job]);
      setNewJob({company: recruiter.company || '', role: '', location: '', salary: '', deadline: '', description: '', min_cgpa: '', eligible_branches: '', color: '#f97316'});
      setShowAddModal(false);
    }).catch(() => alert('Failed to add job'));
  };

  const inp = {width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'10px',color:'white',fontSize:'14px',fontFamily:'Inter,sans-serif'};

  return (
    <div className="internships-content">
      <div className="internships-header">
        <div><h2>Job Postings</h2><p>{jobs.length} active job{jobs.length !== 1 ? 's' : ''}</p></div>
        <button className="export-btn" onClick={() => setShowAddModal(true)} style={{background:'linear-gradient(135deg,#f97316,#ea580c)',border:'none',color:'white',display:'flex',alignItems:'center',gap:'8px',padding:'12px 24px',fontWeight:'600',boxShadow:'0 4px 12px rgba(249,115,22,0.3)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Job
        </button>
      </div>
      <div className="opportunities-grid">
        {jobs.map(job => (
          <div key={job._id || job.id} className="opportunity-card">
            <div className="opp-header">
              <div className="opp-logo" style={{backgroundColor:job.color}}>{job.logo}</div>
              <span className="opp-badge placement">Placement</span>
            </div>
            <h3>{job.role}</h3>
            <p className="opp-company">{job.company}</p>
            {job.description && <p style={{fontSize:'13px',color:'rgba(255,255,255,0.55)',marginBottom:'12px',lineHeight:'1.5'}}>{job.description}</p>}
            <div className="opp-details">
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {job.location}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {job.salary}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Deadline: {job.deadline}</div>
              {job.min_cgpa > 0 && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Min CGPA: {job.min_cgpa}</div>}
              {job.eligible_branches && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> {job.eligible_branches}</div>}
              {job.created_at && <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px'}}>Posted: {new Date(job.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:'6px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {counts[job._id || job.id] || 0} applicant{(counts[job._id || job.id] || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <button className="view-details-btn" onClick={() => handleRemove(job._id || job.id)} style={{background:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.3)',color:'#f87171'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Remove
            </button>
          </div>
        ))}
      </div>
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'580px'}}>
            <div className="modal-header"><h2>Add New Job Posting</h2><button className="close-btn" onClick={() => setShowAddModal(false)}>×</button></div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Company Name *</label><input style={inp} value={newJob.company} onChange={e => setNewJob(p=>({...p,company:e.target.value}))} placeholder="Amazon" /></div>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Location *</label><input style={inp} value={newJob.location} onChange={e => setNewJob(p=>({...p,location:e.target.value}))} placeholder="Bangalore" /></div>
              </div>
              <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Job Role *</label><input style={inp} value={newJob.role} onChange={e => setNewJob(p=>({...p,role:e.target.value}))} placeholder="SDE-1 Campus Hire" /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Salary *</label><input style={inp} value={newJob.salary} onChange={e => setNewJob(p=>({...p,salary:e.target.value}))} placeholder="₹24 LPA" /></div>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Deadline *</label><input style={inp} type="date" value={newJob.deadline} onChange={e => setNewJob(p=>({...p,deadline:e.target.value}))} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Min CGPA</label><input style={inp} type="number" min="0" max="10" step="0.1" value={newJob.min_cgpa} onChange={e => setNewJob(p=>({...p,min_cgpa:e.target.value}))} placeholder="e.g. 7.0" /></div>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Eligible Branches</label><input style={inp} value={newJob.eligible_branches} onChange={e => setNewJob(p=>({...p,eligible_branches:e.target.value}))} placeholder="CSE, IT, ECE" /></div>
              </div>
              <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Job Description</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={newJob.description} onChange={e => setNewJob(p=>({...p,description:e.target.value}))} placeholder="Responsibilities, requirements, perks..." /></div>
              <button className="save-changes-btn" onClick={handleAddJob} style={{background:'linear-gradient(135deg,#f97316,#ea580c)'}}>Post Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InternshipsContent({ cid }) {
  const recruiter = JSON.parse(localStorage.getItem('currentRecruiter') || '{}');
  const [internships, setInternships] = useState([]);
  const [counts, setCounts] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInternship, setNewInternship] = useState({company: recruiter.company || '', role: '', location: '', salary: '', deadline: '', description: '', min_cgpa: '', eligible_branches: '', color: '#10b981'});

  useEffect(() => {
    if (!cid) return;
    getRecruiterJobs(cid).then(data => {
      if (Array.isArray(data)) setInternships(data.filter(j => j.type === 'Internship'));
    }).catch(() => {});
    getApplicantCounts(cid).then(data => setCounts(data || {})).catch(() => {});
  }, [cid]);

  const handleRemove = (id) => {
    if (!window.confirm('Remove this internship posting? All applications will also be affected.')) return;
    deleteJob(id).then(() => setInternships(prev => prev.filter(i => (i._id || i.id) !== id))).catch(() => {});
  };

  const handleAdd = () => {
    if (!newInternship.company || !newInternship.role || !newInternship.location || !newInternship.salary || !newInternship.deadline) {
      alert('Please fill all required fields'); return;
    }
    addJob({...newInternship, logo: newInternship.company.charAt(0).toUpperCase(), type: 'Internship'}).then(i => {
      setInternships(prev => [...prev, i]);
      setNewInternship({company: recruiter.company || '', role: '', location: '', salary: '', deadline: '', description: '', min_cgpa: '', eligible_branches: '', color: '#10b981'});
      setShowAddModal(false);
    }).catch(() => alert('Failed to add internship'));
  };

  const inp = {width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'10px',color:'white',fontSize:'14px',fontFamily:'Inter,sans-serif'};

  return (
    <div className="internships-content">
      <div className="internships-header">
        <div><h2>Internships</h2><p>{internships.length} active internship{internships.length !== 1 ? 's' : ''}</p></div>
        <button className="export-btn" onClick={() => setShowAddModal(true)} style={{background:'linear-gradient(135deg,#f97316,#ea580c)',border:'none',color:'white',display:'flex',alignItems:'center',gap:'8px',padding:'12px 24px',fontWeight:'600',boxShadow:'0 4px 12px rgba(249,115,22,0.3)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Internship
        </button>
      </div>
      <div className="opportunities-grid">
        {internships.map(intern => (
          <div key={intern._id || intern.id} className="opportunity-card">
            <div className="opp-header">
              <div className="opp-logo" style={{backgroundColor:intern.color}}>{intern.logo}</div>
              <span className="opp-badge internship">Internship</span>
            </div>
            <h3>{intern.role}</h3>
            <p className="opp-company">{intern.company}</p>
            {intern.description && <p style={{fontSize:'13px',color:'rgba(255,255,255,0.55)',marginBottom:'12px',lineHeight:'1.5'}}>{intern.description}</p>}
            <div className="opp-details">
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {intern.location}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> {intern.salary}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Deadline: {intern.deadline}</div>
              {intern.min_cgpa > 0 && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Min CGPA: {intern.min_cgpa}</div>}
              {intern.eligible_branches && <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> {intern.eligible_branches}</div>}
              {intern.created_at && <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px'}}>Posted: {new Date(intern.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:'6px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {counts[intern._id || intern.id] || 0} applicant{(counts[intern._id || intern.id] || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <button className="view-details-btn" onClick={() => handleRemove(intern._id || intern.id)} style={{background:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.3)',color:'#f87171'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Remove
            </button>
          </div>
        ))}
      </div>
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'580px'}}>
            <div className="modal-header"><h2>Add New Internship</h2><button className="close-btn" onClick={() => setShowAddModal(false)}>×</button></div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Company Name *</label><input style={inp} value={newInternship.company} onChange={e => setNewInternship(p=>({...p,company:e.target.value}))} placeholder="Google" /></div>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Location *</label><input style={inp} value={newInternship.location} onChange={e => setNewInternship(p=>({...p,location:e.target.value}))} placeholder="Bangalore / Remote" /></div>
              </div>
              <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Internship Role *</label><input style={inp} value={newInternship.role} onChange={e => setNewInternship(p=>({...p,role:e.target.value}))} placeholder="Software Engineer Intern" /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Stipend *</label><input style={inp} value={newInternship.salary} onChange={e => setNewInternship(p=>({...p,salary:e.target.value}))} placeholder="₹50,000/month" /></div>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Deadline *</label><input style={inp} type="date" value={newInternship.deadline} onChange={e => setNewInternship(p=>({...p,deadline:e.target.value}))} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Min CGPA</label><input style={inp} type="number" min="0" max="10" step="0.1" value={newInternship.min_cgpa} onChange={e => setNewInternship(p=>({...p,min_cgpa:e.target.value}))} placeholder="e.g. 6.5" /></div>
                <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Eligible Branches</label><input style={inp} value={newInternship.eligible_branches} onChange={e => setNewInternship(p=>({...p,eligible_branches:e.target.value}))} placeholder="CSE, IT, ECE" /></div>
              </div>
              <div><label style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'6px'}}>Description</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={newInternship.description} onChange={e => setNewInternship(p=>({...p,description:e.target.value}))} placeholder="Responsibilities, requirements, duration..." /></div>
              <button className="save-changes-btn" onClick={handleAdd} style={{background:'linear-gradient(135deg,#f97316,#ea580c)'}}>Post Internship</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardContent({ setActiveTab, cid, recruiter }) {
  const [stats, setStats] = useState({jobs: 0, internships: 0, applicants: 0});

  useEffect(() => {
    if (!cid) return;
    Promise.all([getRecruiterJobs(cid), getApplicants(cid)]).then(([allJobs, applicants]) => {
      const jobs = Array.isArray(allJobs) ? allJobs : [];
      setStats({
        jobs: jobs.filter(j => j.type === 'Placement').length,
        internships: jobs.filter(j => j.type === 'Internship').length,
        applicants: Array.isArray(applicants) ? applicants.length : 0
      });
    }).catch(() => {});
  }, [cid]);

  return (
    <div className="dashboard-content">
      <div className="greeting-card">
        <div>
          <p className="greeting">{(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,'; })()}</p>
          <h1>{recruiter.company || 'Recruiter'}</h1>
          <p className="student-info">Recruiter{recruiter.industry ? ` · ${recruiter.industry}` : ''}</p>
        </div>
        <div className="badge-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg></div>
      </div>
      <div className="stats-grid">
        {[
          {key:'jobs',label:'Jobs Posted',sub:'Active postings',color:'blue',hash:'jobs',icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>},
          {key:'internships',label:'Internships',sub:'Active postings',color:'teal',hash:'internships',icon:<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>},
          {key:'applicants',label:'Total Applicants',sub:'Registered students',color:'green',hash:'applicants',icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>},
        ].map(({key,label,sub,color,hash,icon}) => (
          <div key={key} className={`stat-card ${color}`} onClick={() => window.location.hash = hash} style={{cursor:'pointer'}}>
            <div className="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg></div>
            <h2>{stats[key]}</h2><p>{label}</p><span className="stat-change">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
