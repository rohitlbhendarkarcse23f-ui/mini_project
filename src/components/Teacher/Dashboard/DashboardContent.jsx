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

function DashboardContent({ teacherName, teacherId, teacherDept }) {
  const [stats, setStats] = useState({jobs: 0, internships: 0, clubs: 0, events: 0, students: 0});
  const [nextEvent, setNextEvent] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    Promise.all([getJobs(), getInternships(), getClubs(), getEvents()]).then(([j, i, c, e]) => {
      const clubs = Array.isArray(c) ? c : [];
      const events = Array.isArray(e) ? e : [];
      setStats({
        jobs: (Array.isArray(j) ? j : []).length,
        internships: (Array.isArray(i) ? i : []).length,
        clubs: clubs.length,
        events: events.length,
        students: JSON.parse(localStorage.getItem('students') || '[]').length
      });
      setNextEvent(events[0] || null);
      setTotalMembers(clubs.reduce((sum, c) => sum + (c.members || 0), 0));
    });
  }, []);
  
  return (
    <div className="dashboard-content">
      <div className="greeting-card teacher-greeting-card">
        <div>
          <p className="greeting">{getGreeting()},</p>
          <h1>{teacherName}</h1>
          <p className="student-info">{teacherDept} · Faculty ID: {teacherId}</p>
        </div>
        <div className="badge-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card teacher-stat-card blue" onClick={() => window.location.hash = 'internships'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2>{stats.jobs}</h2>
          <p>Jobs Posted</p>
          <span className="stat-change">Active postings</span>
        </div>
        <div className="stat-card teacher-stat-card blue" onClick={() => window.location.hash = 'internships'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h2>{stats.internships}</h2>
          <p>Internships</p>
          <span className="stat-change">Active postings</span>
        </div>
        <div className="stat-card teacher-stat-card blue" onClick={() => window.location.hash = 'clubs'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2>{stats.clubs}</h2>
          <p>Active Clubs</p>
          <span className="stat-change">{totalMembers}+ members</span>
        </div>
        <div className="stat-card teacher-stat-card orange" onClick={() => window.location.hash = 'events'}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2>{stats.events}</h2>
          <p>All Events</p>
          <span className="stat-change">{nextEvent ? `Next: ${nextEvent.date?.split(' ')[0]}` : 'No events'}</span>
        </div>
      </div>

      <div className="bottom-section">
        <div className="activity-card">
          <h3>Overview</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="dot blue"></span>
              <div>
                <p>{stats.students} students registered</p>
                <span className="time blue">Total</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="dot green"></span>
              <div>
                <p>{stats.events} events scheduled</p>
                <span className="time green">Active</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="dot yellow"></span>
              <div>
                <p>{stats.clubs} clubs active</p>
                <span className="time yellow">{totalMembers}+ members</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="dot blue"></span>
              <div>
                <p>{stats.jobs + stats.internships} opportunities posted</p>
                <span className="time blue">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;
