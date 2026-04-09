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

export default InternshipsContent;
