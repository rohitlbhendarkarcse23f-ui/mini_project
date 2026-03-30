import './Login.css?v=2';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signIn } from '../api/auth';
import API_BASE from '../api/config';

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Try teacher login first
    try {
      const res = await fetch(`${API_BASE}/teachers/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentTeacher', JSON.stringify(data.teacher));
        setLoading(false);
        navigate('/teacher/dashboard');
        return;
      }
    } catch (_) {}

    // Try student login
    try {
      const data = await signIn(identifier, password);
      localStorage.setItem('currentStudent', JSON.stringify({
        student_id: data.student_id,
        email: data.email || identifier,
        name: data.name,
        phone: data.phone,
        department: data.department,
        year: data.year,
        semester: data.semester
      }));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>Welcome Back !!</h1>
        <p>Sign in to your Smart Campus Account</p>
        <form onSubmit={handleSubmit}>
          {error && <div style={{color: '#ef4444', marginBottom: '16px', textAlign: 'center'}}>{error}</div>}
          <div className="input-group">
            <label>Email or Student ID</label>
            <input type="text" placeholder="Enter email or student ID" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="student-signin-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="student-signup-text">
          Don't have an Account? <Link to="/student/signup">Student Sign Up</Link>
          <span style={{margin:'0 8px',color:'rgba(255,255,255,0.3)'}}>·</span>
          <Link to="/teacher/signup">Teacher Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
