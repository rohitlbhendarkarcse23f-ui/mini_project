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

function ClubsContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const [filter, setFilter] = useState('All');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [joinStep, setJoinStep] = useState('payment');
  const [joinedClubs, setJoinedClubs] = useState(() => {
    const saved = localStorage.getItem(`joinedClubs_${student.student_id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptClub, setReceiptClub] = useState(null);
  const defaultClubs = [
    { id: 1, name: 'NSS - National Service Scheme', desc: 'Community service, blood donation drives, cleanliness campaigns, and rural outreach programs.', members: 334, category: 'Social', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: '#10b981' },
    { id: 2, name: 'Coding Club', desc: 'Weekly coding challenges, competitive programming, and project building. Open to all branches.', members: 245, category: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#3b82f6' },
    { id: 3, name: 'Music Club', desc: 'Instrumental and vocal training, jam sessions, and performances at college events.', members: 203, category: 'Cultural', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: '#ec4899' },
    { id: 4, name: 'Entrepreneurship Cell', desc: 'Startup ideas to reality. Mentorship programs, investor connections, and pitch competitions.', members: 178, category: 'Academic', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: '#f59e0b' },
    { id: 5, name: 'Photography Club', desc: 'Capture campus life and memories. Monthly photo walks and workshops by professional photographers.', members: 156, category: 'Cultural', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', color: '#8b5cf6' },
    { id: 6, name: 'Debate & MUN Society', desc: 'Model United Nations, parliamentary debates, and public speaking workshops.', members: 134, category: 'Academic', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#06b6d4' },
    { id: 7, name: 'Drama & Theatre Club', desc: 'Perform in campus plays, street plays, and competitions. No prior experience needed!', members: 112, category: 'Cultural', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', color: '#f59e0b' },
    { id: 8, name: 'Robotics Society', desc: 'Build and program robots for national competitions. Annual RoboWars event organized by us.', members: 89, category: 'Technical', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', color: '#ef4444' }
  ];
  const [clubs, setClubs] = useState(defaultClubs);

  useEffect(() => {
    getClubs().then(data => { if (Array.isArray(data) && data.length > 0) setClubs(data); }).catch(() => {});
  }, []);

  const totalMembers = clubs.reduce((sum, club) => sum + club.members, 0);
  const technicalCount = clubs.filter(c => c.category === 'Technical').length;
  const culturalCount = clubs.filter(c => c.category === 'Cultural').length;
  
  const filtered = filter === 'All' ? clubs : clubs.filter(c => c.category === filter);
  
  const handleJoinClub = (club) => {
    setSelectedClub(club);
    setShowJoinModal(true);
    setJoinStep('payment');
  };

  const handlePaymentComplete = () => {
    setJoinStep('joining');
    setTimeout(() => {
      setJoinStep('success');
      const updated = [...joinedClubs, selectedClub.id];
      setJoinedClubs(updated);
      localStorage.setItem(`joinedClubs_${student.student_id}`, JSON.stringify(updated));
      
      const updatedClubs = clubs.map(c => 
        c.id === selectedClub.id ? {...c, members: c.members + 1} : c
      );
      setClubs(updatedClubs);
    }, 2000);
  };

  const handleWhatsAppJoin = () => {
    if (selectedClub?.whatsapp) {
      window.open(selectedClub.whatsapp, '_blank');
    }
  };

  const handleViewReceipt = (club) => {
    setReceiptClub(club);
    setShowReceipt(true);
  };

  return (
    <div className="clubs-content">
      <div className="clubs-header">
        <div>
          <h2>Campus Clubs</h2>
          <p>{clubs.length} active clubs · {totalMembers.toLocaleString()} total members</p>
        </div>
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
              {joinedClubs.includes(club.id) ? (
                <div style={{display: 'flex', gap: '8px'}}>
                  <button className="join-btn" style={{borderColor: '#10b981', color: '#10b981', background: 'rgba(16,185,129,0.1)', cursor: 'default'}} disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Joined
                  </button>
                  <button className="join-btn" style={{borderColor: club.color, color: club.color, background: 'rgba(59,130,246,0.1)'}} onClick={() => handleViewReceipt(club)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    </svg>
                    Receipt
                  </button>
                </div>
              ) : (
                <button className="join-btn" style={{borderColor: club.color, color: club.color}} onClick={() => handleJoinClub(club)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showJoinModal && selectedClub && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content join-modal" onClick={(e) => e.stopPropagation()}>
            {joinStep === 'payment' ? (
              <div>
                <div className="modal-header">
                  <h2>Join Club</h2>
                  <button className="close-btn" onClick={() => setShowJoinModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="club-payment-card">
                    <div className="club-payment-icon" style={{backgroundColor: selectedClub.color}}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d={selectedClub.icon}/>
                      </svg>
                    </div>
                    <h3>{selectedClub.name}</h3>
                    <p className="club-payment-desc">Annual Membership • {selectedClub.members}+ Members</p>
                    <div className="club-payment-price">
                      <span className="price-label">Membership Fee</span>
                      <span className="price-amount">₹500</span>
                      <span className="price-period">/year</span>
                    </div>
                  </div>
                  <div className="club-benefits">
                    <h4>What's Included:</h4>
                    <div className="benefit-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>Access to all club events</span>
                    </div>
                    <div className="benefit-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>WhatsApp group membership</span>
                    </div>
                    <div className="benefit-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>Exclusive workshops & resources</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@paytm" />
                  </div>
                  <button className="club-pay-btn" style={{background: selectedClub.color}} onClick={handlePaymentComplete}>
                    Pay ₹500 & Join Club
                  </button>
                </div>
              </div>
            ) : joinStep === 'joining' ? (
              <div className="join-animation">
                <div className="spinner-container">
                  <div className="spinner" style={{borderTopColor: selectedClub.color}}></div>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={selectedClub.color} strokeWidth="2" className="club-icon-anim">
                    <path d={selectedClub.icon}/>
                  </svg>
                </div>
                <h3>Joining {selectedClub.name}...</h3>
                <p>Please wait while we process your request</p>
              </div>
            ) : (
              <div className="join-success">
                <div className="success-checkmark">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" className="check-circle"/>
                    <path d="M8 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-path"/>
                  </svg>
                </div>
                <h2>Welcome to {selectedClub.name}!</h2>
                <p>You've successfully joined the club. Connect with {selectedClub.members}+ members on WhatsApp.</p>
                <button className="whatsapp-btn" onClick={handleWhatsAppJoin}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Join WhatsApp Group
                </button>
                <button className="close-modal-btn" onClick={() => { 
                  setShowJoinModal(false);
                }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showReceipt && receiptClub && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceipt(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-content">
                <div className="receipt-header">
                  <h3>Smart Campus</h3>
                  <p>KDK College of Engineering</p>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-details">
                  <div className="receipt-row">
                    <span>Student Name:</span>
                    <strong>{student.name || student.email?.split('@')[0] || 'Student'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Student ID:</span>
                    <strong>{student.student_id || 'N/A'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Club Name:</span>
                    <strong>{receiptClub.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Category:</span>
                    <strong>{receiptClub.category}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction ID:</span>
                    <strong>TXN{Date.now().toString().slice(-9)}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Date:</span>
                    <strong>{new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</strong>
                  </div>
                  <div className="receipt-divider"></div>
                  <div className="receipt-row receipt-total">
                    <span>Amount Paid:</span>
                    <strong>₹500</strong>
                  </div>
                </div>
                <div className="receipt-footer">
                  <p>This is a computer-generated receipt</p>
                </div>
              </div>
              <button className="save-changes-btn" onClick={async () => {
                const { jsPDF } = await import('jspdf');
                const doc = new jsPDF({ unit: 'mm', format: 'a5' });
                const W = 148;
                doc.setFillColor(30, 58, 138); doc.rect(0, 0, W, 28, 'F');
                doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
                doc.text('Smart Campus', 10, 12);
                doc.setFontSize(9); doc.setFont('helvetica','normal');
                doc.text('KDK College of Engineering', 10, 20);
                doc.text('CLUB MEMBERSHIP RECEIPT', W - 10, 12, { align: 'right' });
                let y = 38;
                doc.setTextColor(30,30,30); doc.setFontSize(10);
                const row = (l, v) => { doc.setFont('helvetica','bold'); doc.text(l, 10, y); doc.setFont('helvetica','normal'); doc.text(String(v), 80, y); y += 8; };
                row('Student Name:', student.name || student.email?.split('@')[0] || 'Student');
                row('Student ID:', student.student_id || 'N/A');
                row('Club Name:', receiptClub.name);
                row('Category:', receiptClub.category);
                row('Transaction ID:', `TXN${Date.now().toString().slice(-9)}`);
                row('Payment Date:', new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}));
                doc.setDrawColor(200,200,200); doc.line(10, y, W - 10, y); y += 8;
                doc.setFont('helvetica','bold'); doc.setFontSize(12);
                doc.text('Amount Paid:', 10, y); doc.setTextColor(22,163,74);
                doc.text('Rs. 500', 80, y);
                y += 14; doc.setTextColor(150,150,150); doc.setFontSize(8); doc.setFont('helvetica','normal');
                doc.text('This is a computer-generated receipt.', W / 2, y, { align: 'center' });
                doc.save(`club_receipt_${receiptClub.name.replace(/\s+/g,'_')}.pdf`);
                toast('Receipt downloaded!');
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubsContent;
