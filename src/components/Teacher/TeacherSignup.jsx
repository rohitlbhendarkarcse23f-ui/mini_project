import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../auth.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Other'
];

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', teacher_id: '', phone: '', department: '', designation: 'Assistant Professor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.teacher_id || !form.department) { setError('Please fill all required fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/teachers/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, teacher_id: form.teacher_id, phone: form.phone, department: form.department, designation: form.designation })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); return; }
      localStorage.setItem('currentTeacher', JSON.stringify(data.teacher));
      localStorage.setItem('token', data.token);
      navigate('/teacher/dashboard');
    } catch { setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
          </div>
          <h1>Teacher Registration</h1>
          <p>Create your Smart Campus teacher account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Rajesh Kumar" required />
            </div>
            <div className="form-group">
              <label>Teacher ID *</label>
              <input type="text" value={form.teacher_id} onChange={e => set('teacher_id', e.target.value)} placeholder="TCH001" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="teacher@college.edu" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} required>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <select value={form.designation} onChange={e => set('designation', e.target.value)}>
                {['Professor','Associate Professor','Assistant Professor','Lecturer','HOD','Dean'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit number" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" required />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
