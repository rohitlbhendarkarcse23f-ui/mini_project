import '../RecruiterDashboard.css';
import '../../../theme.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecruiterJobs, addJob, deleteJob, getApplicants, searchCandidates, updateApplicationStatus, getApplicantCounts } from '../../../utils/jobsStore';
import { getRecruiterProfile, saveRecruiterProfile, getAllStudents } from '../../../api/profiles';
import { toast } from '../../Toast';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
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

export default ProfileContent;
