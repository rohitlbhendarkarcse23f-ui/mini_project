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

export default ApplicantsContent;
