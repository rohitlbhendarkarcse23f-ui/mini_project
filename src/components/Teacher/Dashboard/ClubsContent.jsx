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

function ClubsContent() {
  const [filter, setFilter] = useState('All');
  const defaultClubs = [
        { id: 1, name: 'NSS - National Service Scheme', desc: 'Community service, blood donation drives, cleanliness campaigns, and rural outreach programs.', members: 334, category: 'Social', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: '#10b981' },
        { id: 2, name: 'Coding Club', desc: 'Weekly coding challenges, competitive programming, and project building. Open to all branches.', members: 245, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6' },
        { id: 3, name: 'Music Club', desc: 'Instrumental and vocal training, jam sessions, and performances at college events.', members: 203, category: 'Cultural', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: '#ec4899' },
        { id: 4, name: 'Entrepreneurship Cell', desc: 'Startup ideas to reality. Mentorship programs, investor connections, and pitch competitions.', members: 178, category: 'Academic', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: '#8b5cf6' },
        { id: 5, name: 'Photography Club', desc: 'Capture campus life and memories. Monthly photo walks and workshops by professional photographers.', members: 156, category: 'Cultural', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', color: '#8b5cf6' },
        { id: 6, name: 'Debate & MUN Society', desc: 'Model United Nations, parliamentary debates, and public speaking workshops.', members: 134, category: 'Academic', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#06b6d4' },
        { id: 7, name: 'Drama & Theatre Club', desc: 'Perform in campus plays, street plays, and competitions. No prior experience needed!', members: 112, category: 'Cultural', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', color: '#8b5cf6' },
        { id: 8, name: 'Robotics Society', desc: 'Build and program robots for national competitions. Annual RoboWars event organized by us.', members: 89, category: 'Technical', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', color: '#ef4444' }
  ];
  const [clubs, setClubs] = useState(defaultClubs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClub, setNewClub] = useState({name: '', desc: '', members: 0, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6', whatsapp: '', fee: 500, gpay: ''});

  useEffect(() => {
    getClubs().then(data => { if (Array.isArray(data) && data.length > 0) setClubs(data); }).catch(() => {});
  }, []);

  const totalMembers = clubs.reduce((sum, club) => sum + club.members, 0);
  const technicalCount = clubs.filter(c => c.category === 'Technical').length;
  const culturalCount = clubs.filter(c => c.category === 'Cultural').length;
  
  const filtered = filter === 'All' ? clubs : clubs.filter(c => c.category === filter);
  
  const handleRemoveClub = (clubId) => {
    deleteClub(clubId).catch(() => {});
    setClubs(prev => prev.filter(c => c.id !== clubId));
  };

  const handleDownloadList = (club) => {
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const joinedStudents = allStudents.filter(student => {
      const joined = JSON.parse(localStorage.getItem(`joinedClubs_${student.student_id}`) || '[]');
      return joined.includes(club.id);
    });
    
    let csv = `Club: ${club.name}\nCategory: ${club.category}\nTotal Members: ${joinedStudents.length}\nMembership Fee: ₹500\n\nMembers List:\nName,Email,Phone,Student ID,Payment Status,Transaction ID,Payment Date\n`;
    
    joinedStudents.forEach(student => {
      const name = student.email.split('@')[0];
      const txnId = `TXN${Date.now().toString().slice(-9)}`;
      const date = new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
      csv += `${name},${student.email},${student.phone || 'N/A'},${student.student_id},Paid,${txnId},${date}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${club.name.replace(/[^a-z0-9]/gi, '_')}_members.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddClub = () => {
    if (!newClub.name || !newClub.desc || !newClub.whatsapp || !newClub.gpay) {
      alert('Please fill all required fields');
      return;
    }
    addClub(newClub).then(saved => {
      setClubs(prev => [...prev, saved]);
      setShowAddModal(false);
      setNewClub({name: '', desc: '', members: 0, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6', whatsapp: '', fee: 500, gpay: ''});
    }).catch(() => alert('Failed to add club'));
  };

  return (
    <div className="clubs-content">
      <div className="clubs-header">
        <div>
          <h2>Campus Clubs</h2>
          <p>{clubs.length} active clubs · {totalMembers.toLocaleString()} total members</p>
        </div>
        <button className="export-btn" onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Club
        </button>
      </div>
      <div className="clubs-stats">
        <div className="club-stat">
          <h3>{clubs.length}</h3>
          <p>Total Clubs</p>
        </div>
        <div className="club-stat">
          <h3>{totalMembers.toLocaleString()}</h3>
          <p>Members</p>
        </div>
        <div className="club-stat">
          <h3>{technicalCount}</h3>
          <p>Technical</p>
        </div>
        <div className="club-stat">
          <h3>{culturalCount}</h3>
          <p>Cultural</p>
        </div>
      </div>
      <div className="club-filters">
        <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
        <button className={filter === 'Social' ? 'active' : ''} onClick={() => setFilter('Social')}>Social</button>
        <button className={filter === 'Technical' ? 'active' : ''} onClick={() => setFilter('Technical')}>Technical</button>
        <button className={filter === 'Cultural' ? 'active' : ''} onClick={() => setFilter('Cultural')}>Cultural</button>
        <button className={filter === 'Academic' ? 'active' : ''} onClick={() => setFilter('Academic')}>Academic</button>
      </div>
      <div className="clubs-grid">
        {filtered.map(club => (
          <div key={club.id} className="club-card">
            <div className="club-card-header">
              <div className="club-icon" style={{backgroundColor: club.color + '20'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={club.color} strokeWidth="2">
                  <path d={club.icon}/>
                </svg>
              </div>
              <span className="club-category" style={{backgroundColor: club.color + '20', color: club.color}}>{club.category}</span>
            </div>
            <h3>{club.name}</h3>
            <p className="club-desc">{club.desc}</p>
            <div className="club-footer">
              <div className="club-members">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {club.members} members
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="join-btn" style={{borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '6px 12px'}} onClick={() => handleDownloadList(club)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button className="join-btn" style={{borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.1)'}} onClick={() => handleRemoveClub(club.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Club</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Club Name *</label>
                <input type="text" value={newClub.name} onChange={(e) => setNewClub({...newClub, name: e.target.value})} placeholder="Chess Club" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={newClub.desc} onChange={(e) => setNewClub({...newClub, desc: e.target.value})} rows="3" placeholder="Brief description of the club..."></textarea>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={newClub.category} onChange={(e) => setNewClub({...newClub, category: e.target.value})} style={{width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '16px'}}>
                  <option style={{background: '#1a1d2e'}}>Social</option>
                  <option style={{background: '#1a1d2e'}}>Technical</option>
                  <option style={{background: '#1a1d2e'}}>Cultural</option>
                  <option style={{background: '#1a1d2e'}}>Academic</option>
                </select>
              </div>
              <div className="form-group">
                <label>Initial Members</label>
                <input type="number" value={newClub.members} onChange={(e) => setNewClub({...newClub, members: parseInt(e.target.value)})} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Membership Fee (₹) *</label>
                <input type="number" value={newClub.fee} onChange={(e) => setNewClub({...newClub, fee: parseInt(e.target.value)})} placeholder="500" />
              </div>
              <div className="form-group">
                <label>WhatsApp Group Link *</label>
                <input type="text" value={newClub.whatsapp} onChange={(e) => setNewClub({...newClub, whatsapp: e.target.value})} placeholder="https://chat.whatsapp.com/..." />
              </div>
              <div className="form-group">
                <label>GPay Number *</label>
                <input type="text" value={newClub.gpay} onChange={(e) => setNewClub({...newClub, gpay: e.target.value})} placeholder="9876543210" />
              </div>
              <button className="save-changes-btn" onClick={handleAddClub}>Add Club</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubsContent;
