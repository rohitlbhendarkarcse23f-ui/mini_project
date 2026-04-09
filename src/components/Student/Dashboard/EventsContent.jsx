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

function EventsContent() {
  const [filter, setFilter] = useState('All');
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    const saved = localStorage.getItem('registeredEvents');
    return saved ? JSON.parse(saved) : [];
  });
  const [eventCounts, setEventCounts] = useState(() => {
    const saved = localStorage.getItem('eventCounts');
    return saved ? JSON.parse(saved) : {};
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then(apiEvents => {
      if (Array.isArray(apiEvents)) setEvents(apiEvents);
    }).catch(() => {});
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);


  const handleRegister = async (eventKey) => {
    if (!registeredEvents.includes(eventKey)) {
      const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
      const newRegistered = [...registeredEvents, eventKey];
      const newCounts = {...eventCounts, [eventKey]: (eventCounts[eventKey] || 0) + 1};
      setRegisteredEvents(newRegistered);
      setEventCounts(newCounts);
      localStorage.setItem('registeredEvents', JSON.stringify(newRegistered));
      localStorage.setItem('eventCounts', JSON.stringify(newCounts));
      
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/events/${eventKey}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            student_id: student.student_id,
            email: student.email,
            phone: student.phone || 'N/A',
            name: student.name || student.email?.split('@')[0] || 'Student',
            department: student.department || 'N/A'
          })
        });
      } catch (err) {}
    }
  };

  const getRegisteredCount = (event) => {
    if (typeof event.registered !== 'string' || !event.registered.includes('/')) {
      const count = (event.registered_count || 0) + (eventCounts[event._id || event.id] || 0);
      const cap = event.capacity || 100;
      return `${count}/${cap}`;
    }
    const [current, total] = event.registered.split('/');
    const newCurrent = parseInt(current) + (eventCounts[event.id] || 0);
    return `${newCurrent}/${total}`;
  };

  const getPercent = (event) => {
    if (typeof event.registered !== 'string' || !event.registered.includes('/')) {
      const count = (event.registered_count || 0) + (eventCounts[event._id || event.id] || 0);
      const cap = event.capacity || 100;
      return Math.round((count / cap) * 100);
    }
    const [current, total] = event.registered.split('/');
    const newCurrent = parseInt(current) + (eventCounts[event.id] || 0);
    return Math.round((newCurrent / parseInt(total)) * 100);
  };

  return (
    <div className="events-content">
      <div className="events-header">
        <div>
          <h2>All Events</h2>
          <p>{events.length} events scheduled</p>
        </div>
      </div>
      <div className="event-filters">
        <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
        <button className={filter === 'Workshop' ? 'active' : ''} onClick={() => setFilter('Workshop')}>Workshop</button>
        <button className={filter === 'Seminar' ? 'active' : ''} onClick={() => setFilter('Seminar')}>Seminar</button>
        <button className={filter === 'Placement' ? 'active' : ''} onClick={() => setFilter('Placement')}>Placement</button>
        <button className={filter === 'Technical' ? 'active' : ''} onClick={() => setFilter('Technical')}>Technical</button>
        <button className={filter === 'Sports' ? 'active' : ''} onClick={() => setFilter('Sports')}>Sports</button>
        <button className={filter === 'Cultural' ? 'active' : ''} onClick={() => setFilter('Cultural')}>Cultural</button>
      </div>
      <div className="events-grid">
        {filtered.map(event => {
          const eventKey = event._id || event.id;
          return (
          <div key={eventKey} className="event-card" style={{borderColor: event.color + '40'}}>
            <div className="event-card-header">
              <span className="event-type" style={{backgroundColor: event.color + '30', color: event.color}}>{event.type}</span>
              <span className="days-left">{event.daysLeft} days left</span>
            </div>
            <h3>{event.title}</h3>
            <p className="event-desc">{event.desc}</p>
            <div className="event-details">
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {event.date}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {event.time}</div>
              <div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {event.location}</div>
            </div>
            <div className="event-registration">
              <div className="reg-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>{getRegisteredCount(event)} registered</span>
                <span className="reg-percent">{getPercent(event)}% full</span>
              </div>
              <div className="reg-progress">
                <div className="reg-bar" style={{width: getPercent(event) + '%', backgroundColor: getPercent(event) > 90 ? '#ef4444' : getPercent(event) > 70 ? '#f59e0b' : '#3b82f6'}}></div>
              </div>
            </div>
            <button className="register-btn" style={{borderColor: event.color, color: event.color, ...(registeredEvents.includes(eventKey) && {background: event.color, color: 'white'})}} onClick={() => handleRegister(eventKey)} disabled={registeredEvents.includes(eventKey)}>
              {registeredEvents.includes(eventKey) ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Registered
                </>
              ) : 'Register Now'}
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventsContent;
