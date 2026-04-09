import '../TeacherDashboard.css';
import '../../Student/StudentDashboard.css';
import '../../../theme.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, addEvent, removeEvent } from '../../../utils/eventsStore';
import { getJobs, getInternships } from '../../../utils/jobsStore';
import { getClubs, deleteClub, addClub } from '../../../utils/clubsStore';
import MeritList from '../MeritList';
import TeacherMarksheetParser from '../TeacherMarksheetParser';
import { getTeacherProfile, saveTeacherProfile } from '../../../api/profiles';
import { toast } from '../../Toast';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

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

  const showToast = (msg) => toast(msg);

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

export default ProfileContent;
