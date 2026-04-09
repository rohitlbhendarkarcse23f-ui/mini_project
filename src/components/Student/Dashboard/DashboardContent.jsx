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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function readSgpaFromStorage(studentId) {
  const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
  const profile = profiles[studentId] || {};
  const sgpaList = profile.sgpaList || [];
  const validSgpas = sgpaList.filter(v => v != null && v > 0);
  return {
    currentSgpa: validSgpas.length > 0 ? validSgpas[validSgpas.length - 1] : 0,
    cgpa: profile.cgpa || 0,
    semester: profile.semester || null,
  };
}

function DashboardContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const studentName = student.name || student.email?.split('@')[0] || 'Student';
  const studentId = student.student_id || '';
  const semester = student.semester || '';
  const department = student.department || '';

  const [stats, setStats] = useState({jobs: 0, internships: 0, clubs: 0, events: 0});
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [currentSgpa, setCurrentSgpa] = useState(0);
  const [profileSemester, setProfileSemester] = useState(semester);

  const loadSgpa = () => {
    if (!studentId) return;
    // First read from localStorage for instant display
    const local = readSgpaFromStorage(studentId);
    if (local.currentSgpa > 0) {
      setCurrentSgpa(local.currentSgpa);
      setCgpa(local.cgpa);
      if (local.semester) setProfileSemester(local.semester);
    }
    // Then sync from API
    getStudentProfile(studentId).then(data => {
      if (!data) return;
      const sgpaList = data.sgpaList || [];
      const validSgpas = sgpaList.filter(v => v != null && v > 0);
      const apiSgpa = validSgpas.length > 0 ? validSgpas[validSgpas.length - 1] : 0;
      const apiCgpa = data.cgpa || 0;
      // Use whichever is more up-to-date (prefer local if API hasn't synced yet)
      setCurrentSgpa(prev => apiSgpa > 0 ? apiSgpa : prev);
      setCgpa(prev => apiCgpa > 0 ? apiCgpa : prev);
      setProfileSemester(data.semester || semester);
    }).catch(() => {});
  };

  useEffect(() => {
    Promise.all([getJobs(), getInternships(), getClubs(), getEvents()]).then(([j, i, c, e]) => {
      setStats({ jobs: (j||[]).length, internships: (i||[]).length, clubs: (c||[]).length, events: (e||[]).length });
      setJobs((j||[]).slice(0, 1));
      setClubs((c||[]).slice(0, 2));
      setEvents((e||[]).slice(0, 2));
    });
    loadSgpa();
    // Re-read SGPA whenever marksheet is saved (MarksheetUpload dispatches 'storage')
    window.addEventListener('storage', loadSgpa);
    return () => window.removeEventListener('storage', loadSgpa);
  }, []);

  const activities = [
    ...jobs.map(j => ({ text: `${j.company} job posted`, time: 'New', color: 'blue', link: 'jobs' })),
    ...events.map(e => ({ text: `${e.title}`, time: `${e.daysLeft} days left`, color: 'green', link: 'events' })),
    ...clubs.map(c => ({ text: `${c.name} - ${c.members} members`, time: 'Active', color: 'yellow', link: 'clubs' }))
  ].slice(0, 4);

  return (
    <div className="dashboard-content">
      <div className="greeting-card">
        <div>
          <p className="greeting">{getGreeting()},</p>
          <h1>{studentName}</h1>
          <p className="student-info">{department}{department && semester ? ' · ' : ''}{semester ? `Semester ${semester}` : ''}</p>
        </div>
        <div className="badge-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue" onClick={() => window.location.hash = 'jobs'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2>{stats.jobs}</h2>
          <p>Jobs Posted</p>
          <span className="stat-change">Available now</span>
        </div>
        <div className="stat-card teal" onClick={() => window.location.hash = 'internships'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h2>{stats.internships}</h2>
          <p>Internships</p>
          <span className="stat-change">Available now</span>
        </div>
        <div className="stat-card green" onClick={() => window.location.hash = 'clubs'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2>{stats.clubs}</h2>
          <p>Active Clubs</p>
          <span className="stat-change">{clubs.reduce((sum, c) => sum + c.members, 0)}+ members</span>
        </div>
        <div className="stat-card blue" onClick={() => window.location.hash = 'events'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2>{stats.events}</h2>
          <p>All Events</p>
          <span className="stat-change">{events.length > 0 ? `Next: ${events[0]?.date?.split(' ')[0] || 'Soon'}` : 'No events'}</span>
        </div>
      </div>

      <div className="bottom-section">
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {activities.length === 0 ? (
              <p style={{color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px'}}>No recent activity</p>
            ) : (
              activities.map((activity, idx) => (
                <div key={idx} className="activity-item" onClick={() => window.location.hash = activity.link} style={{cursor: 'pointer'}}>
                  <span className={`dot ${activity.color}`}></span>
                  <div>
                    <p>{activity.text}</p>
                    <span className={`time ${activity.color}`}>{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-access">
          <h3>Academic Performance</h3>
          <div className="cgpa-card">
            <div className="cgpa-header">
              <span>Current Semester SGPA</span>
              <span className="semester">Semester {profileSemester || semester}</span>
            </div>
            <h2>{currentSgpa.toFixed(2)} <span>/ 10.0</span></h2>
            <div className="progress-bar">
              <div className="progress" style={{width: `${(currentSgpa/10)*100}%`}}></div>
            </div>
            {cgpa > 0 && (
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginTop:'8px',textAlign:'center'}}>
                Overall CGPA: <strong style={{color:'#60a5fa'}}>{cgpa.toFixed(2)}</strong>
              </p>
            )}
            {currentSgpa === 0 && (
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',marginTop:'8px',textAlign:'center'}}>
                Upload marksheet to see your SGPA
              </p>
            )}
            {/* SGPA Trend Chart */}
            {(() => {
              const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
              const sgpaList = (profiles[studentId]?.sgpaList || []).filter(v => v != null && v > 0);
              if (sgpaList.length < 2) return null;
              const W = 260, H = 80, pad = 10;
              const maxV = Math.max(...sgpaList, 10);
              const pts = sgpaList.map((v, i) => [
                pad + (i / (sgpaList.length - 1)) * (W - pad * 2),
                H - pad - ((v / maxV) * (H - pad * 2))
              ]);
              const polyline = pts.map(p => p.join(',')).join(' ');
              const area = `${pts[0][0]},${H - pad} ` + polyline + ` ${pts[pts.length-1][0]},${H - pad}`;
              return (
                <div style={{marginTop:'14px'}}>
                  <p style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginBottom:'6px'}}>SGPA Trend</p>
                  <svg width={W} height={H} style={{overflow:'visible'}}>
                    <defs>
                      <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <polygon points={area} fill="url(#sgpaGrad)"/>
                    <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p[0]} cy={p[1]} r="3" fill="#3b82f6"/>
                        <text x={p[0]} y={p[1] - 7} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">{sgpaList[i].toFixed(1)}</text>
                        <text x={p[0]} y={H - 1} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">S{i+1}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;
