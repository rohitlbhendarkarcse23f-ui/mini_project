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

export default JobsContent;
