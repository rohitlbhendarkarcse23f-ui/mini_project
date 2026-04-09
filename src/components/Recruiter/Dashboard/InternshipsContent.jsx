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

export default InternshipsContent;
