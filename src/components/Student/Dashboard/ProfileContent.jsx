import '../StudentDashboard.css';
import '../StudentDashboard2.css';
import '../../../theme.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getRemovedEvents } from '../../../utils/eventsStore';
import { getJobs, getInternships, applyForJob } from '../../../utils/jobsStore';
import { getClubs } from '../../../utils/clubsStore';
import MarksheetUpload from '../MarksheetUpload';
import AIMarksheetUpload from '../MarksheetUpload';
import { getStudentProfile, saveStudentProfile, saveSkills, saveExperiences, saveCertificates, saveMarksheets, uploadFile } from '../../../api/profiles';
import { toast } from '../../Toast';

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Other'
];

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

export default ProfileContent;
