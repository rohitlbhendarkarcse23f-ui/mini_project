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

function EventsContent() {
  const [filter, setFilter] = useState('All');
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'Workshop', title: '', desc: '', date: '', time: '', location: '', capacity: '100', daysLeft: 0
  });

  useEffect(() => {
    getEvents().then(data => { if (Array.isArray(data)) setEvents(data); }).catch(() => {});
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);

  const handleRemove = (event) => {
    const id = event.event_id || event.id;
    removeEvent(id).catch(() => {});
    setEvents(prev => prev.filter(e => (e.event_id || e.id) !== id));
  };

  const handleDownloadList = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      const res = await fetch(`${API}/db/event_registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allDocs = await res.json();
      const registeredStudents = allDocs.filter(d => d._docId?.startsWith(`${event.id}_`));

      if (registeredStudents.length === 0) {
        alert('No students have registered for this event yet.');
        return;
      }

      let csv = `Event: ${event.title}\nType: ${event.type}\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\nRegistered: ${registeredStudents.length}\n\nRegistered Students:\nName,Email,Phone,Student ID,Department\n`;
      registeredStudents.forEach(student => {
        csv += `${student.name},${student.email},${student.phone},${student.student_id},${student.department || 'N/A'}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading list:', err);
      alert('Error downloading list. Please try again.');
    }
  };

  const getEventColor = (type) => {
    const colors = {'Workshop': '#0d9488', 'Seminar': '#7c3aed', 'Placement': '#059669', 'Technical': '#1e40af', 'Sports': '#8b5cf6', 'Cultural': '#7e22ce'};
    return colors[type] || '#3b82f6';
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      alert('Please fill all required fields');
      return;
    }
    addEvent({ ...newEvent, registered: `0/${newEvent.capacity}`, color: getEventColor(newEvent.type), percent: 0 })
      .then(saved => {
        setEvents(prev => [...prev, saved]);
        setShowAddModal(false);
        setNewEvent({type: 'Workshop', title: '', desc: '', date: '', time: '', location: '', capacity: '100', daysLeft: 0});
      }).catch(() => alert('Failed to add event'));
  };

  const getRegisteredCount = (event) => event.registered || '0/100';
  const getPercent = (event) => event.percent || 0;

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
        <button className="export-btn" onClick={() => setShowAddModal(true)} style={{marginLeft: 'auto'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Event
        </button>
      </div>
      <div className="events-grid">
        {filtered.map(event => (
          <div key={event.id} className="event-card" style={{borderColor: event.color + '40'}}>
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
                <div className="reg-bar" style={{width: getPercent(event) + '%', backgroundColor: getPercent(event) > 90 ? '#ef4444' : getPercent(event) > 70 ? '#8b5cf6' : '#3b82f6'}}></div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="register-btn" style={{borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.1)', flex: 1}} onClick={() => handleRemove(event)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Remove
              </button>
              <button className="register-btn" style={{borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59,130,246,0.1)'}} onClick={() => handleDownloadList(event)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download List
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Event</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Type *</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})} style={{width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '16px'}}>
                  <option style={{background: '#1a1d2e'}}>Workshop</option>
                  <option style={{background: '#1a1d2e'}}>Seminar</option>
                  <option style={{background: '#1a1d2e'}}>Placement</option>
                  <option style={{background: '#1a1d2e'}}>Technical</option>
                  <option style={{background: '#1a1d2e'}}>Sports</option>
                  <option style={{background: '#1a1d2e'}}>Cultural</option>
                </select>
              </div>
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} placeholder="Workshop: AI & Machine Learning" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={newEvent.desc} onChange={(e) => setNewEvent({...newEvent, desc: e.target.value})} rows="3" placeholder="Brief description of the event..."></textarea>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="text" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} placeholder="25 February 2026" />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input type="text" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} placeholder="10:00 AM" />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} placeholder="Computer Lab 3, Block A" />
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input type="text" value={newEvent.capacity} onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})} placeholder="100" />
              </div>
              <div className="form-group">
                <label>Days Left</label>
                <input type="number" value={newEvent.daysLeft} onChange={(e) => setNewEvent({...newEvent, daysLeft: parseInt(e.target.value)})} placeholder="10" />
              </div>
              <button className="save-changes-btn" onClick={handleAddEvent}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsContent;
