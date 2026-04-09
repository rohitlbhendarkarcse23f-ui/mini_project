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

function InternshipsContent() {
  const [filter, setFilter] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    getJobs().then(data => { if (Array.isArray(data)) setJobs(data); }).catch(() => {});
    getInternships().then(data => { if (Array.isArray(data)) setInternships(data); }).catch(() => {});
  }, []);
  
  const opportunities = [...internships, ...jobs];
  const filtered = filter === 'All' ? opportunities : opportunities.filter(o => o.type === filter);

  return (
    <div className="internships-content">
      <div className="internships-header">
        <div>
          <h2>Internships & Placements</h2>
          <p>{opportunities.length} opportunities available</p>
        </div>
        <div className="filter-buttons">
          <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
          <button className={filter === 'Internship' ? 'active' : ''} onClick={() => setFilter('Internship')}>Internships</button>
          <button className={filter === 'Placement' ? 'active' : ''} onClick={() => setFilter('Placement')}>Placements</button>
        </div>
      </div>
      <div className="opportunities-grid">
        {filtered.map(opp => (
          <div key={opp.id} className="opportunity-card">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InternshipsContent;
