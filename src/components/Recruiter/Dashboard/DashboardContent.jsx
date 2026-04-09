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

export default DashboardContent;
