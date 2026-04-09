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

export default CandidatesContent;
