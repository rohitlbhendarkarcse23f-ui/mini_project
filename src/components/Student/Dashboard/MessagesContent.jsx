import '../StudentDashboard.css';
import '../StudentDashboard2.css';
import '../../../theme.css';
import { useState, useEffect, useRef } from 'react';

const API_BASE_MSG = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
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

function MessagesContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const senderName = student.name || student.email?.split('@')[0] || 'Student';
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const lastMsgRef = useRef(null);
  const pollRef = useRef(null);
  const sinceRef = useRef(null);

  const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  // Load rooms
  useEffect(() => {
    fetch(`${API_BASE_MSG}/messages/rooms`, { headers: authH() })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setRooms(data); }).catch(() => {});
  }, []);

  // Load messages + start polling when room changes
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedRoom) return;
    sinceRef.current = null;
    setMessages([]);

    const fetchMsgs = (since) =>
      fetch(`${API_BASE_MSG}/messages/${selectedRoom}${since ? `?since=${since}` : ''}`, { headers: authH() })
        .then(r => r.json()).then(data => {
          if (!Array.isArray(data) || data.length === 0) return;
          setMessages(prev => {
            const ids = new Set(prev.map(m => m._id));
            const newMsgs = data.filter(m => !ids.has(m._id));
            return [...prev, ...newMsgs];
          });
          sinceRef.current = data[data.length - 1].created_at;
        }).catch(() => {});

    fetchMsgs(null);
    pollRef.current = setInterval(() => fetchMsgs(sinceRef.current), 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedRoom]);

  // Auto-scroll to bottom
  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedRoom || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_MSG}/messages/${selectedRoom}`, {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ text: messageText.trim(), sender_name: senderName })
      });
      const msg = await res.json();
      if (msg._id) setMessages(prev => [...prev, msg]);
      setMessageText('');
    } catch {}
    setSending(false);
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const currentRoom = rooms.find(r => r.room_id === selectedRoom);

  return (
    <div className="messages-content-whatsapp">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header"><h2>Messages</h2></div>
        <div className="chats-list">
          {rooms.length === 0 && <p style={{color:'rgba(255,255,255,0.3)',padding:'20px',fontSize:'13px'}}>No rooms available</p>}
          {rooms.map(room => (
            <div key={room.room_id} className={`chat-item ${selectedRoom === room.room_id ? 'active' : ''}`} onClick={() => setSelectedRoom(room.room_id)}>
              <div className="chat-avatar">{room.name[0].toUpperCase()}</div>
              <div className="chat-info">
                <div className="chat-header">
                  <h3>{room.name}</h3>
                  <span className="chat-time">{formatTime(room.lastTime)}</span>
                </div>
                <p className="chat-last-msg">{room.lastMsg || 'No messages yet'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedRoom ? (
          <>
            <div className="chat-main-header">
              <div className="chat-avatar">{currentRoom?.name[0].toUpperCase()}</div>
              <div>
                <h3>{currentRoom?.name}</h3>
                <p>{currentRoom?.type === 'group' ? 'Group Chat' : 'Personal'}</p>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === student.student_id || msg.sender_name === senderName;
                return (
                  <div key={msg._id || idx} className={`chat-message ${isMine ? 'mine' : ''}`}>
                    {!isMine && <span className="message-sender">{msg.sender_name}</span>}
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={lastMsgRef} />
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type a message..." value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={sending}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesContent;
