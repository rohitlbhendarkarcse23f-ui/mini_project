import '../Student/StudentSignup.css?v=3';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API_BASE from '../../api/config';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Other'
];

function TeacherSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    teacher_id: '', department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const validate = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.teacher_id.trim()) return 'Teacher ID is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.department) return 'Department is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/teachers/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: formData.teacher_id,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          department: formData.department
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentTeacher', JSON.stringify(data.teacher));
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" style={{ maxWidth: '480px' }}>
        <button className="back-btn" onClick={() => navigate('/login')}>←</button>

        <div className="signup-header">
          <h1>Teacher Sign Up</h1>
          <p>Create your Smart Campus teacher account</p>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '12px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Dr. Rajesh Kumar" value={formData.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Teacher ID</label>
            <input type="text" placeholder="e.g. TCH2024001" value={formData.teacher_id} onChange={e => set('teacher_id', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="teacher@kdkce.edu.in" value={formData.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={formData.department} onChange={e => set('department', e.target.value)} required>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={formData.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
          </div>
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="student-signin-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default TeacherSignup;
