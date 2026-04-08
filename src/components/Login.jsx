import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signIn } from '../api/auth';
import API_BASE from '../api/config';
import PasswordInput from './PasswordInput';

const ROLES = [
  { key: 'student',   icon: '👨🎓', label: 'Student' },
  { key: 'teacher',   icon: '👨🏫', label: 'Teacher' },
  { key: 'recruiter', icon: '🏢',   label: 'Recruiter' },
];

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRecruiter = role === 'recruiter';
  const accent = isRecruiter ? 'orange' : 'blue';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'recruiter') {
        const res = await fetch(`${API_BASE}/recruiter/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentRecruiter', JSON.stringify(data.recruiter));
        navigate('/recruiter/dashboard');
        return;
      }

      if (role === 'teacher') {
        const res = await fetch(`${API_BASE}/teachers/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentTeacher', JSON.stringify(data.teacher));
          navigate('/teacher/dashboard');
          return;
        }
        throw new Error('Invalid teacher credentials');
      }

      // Student
      const data = await signIn(identifier, password);
      localStorage.setItem('currentStudent', JSON.stringify({
        student_id: data.student_id,
        email: data.email || identifier,
        name: data.name,
        phone: data.phone,
        department: data.department,
        year: data.year,
        semester: data.semester,
      }));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${accent}`}>
      <div className={`auth-card ${accent}`}>
        <button className="auth-back" onClick={() => navigate('/')}>←</button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/img/smartCampusLogo.png" alt="Logo" />
          </div>
          <span className="auth-logo-name">Campus Connect</span>
        </div>

        <div className="auth-header">
          <h1 className={accent}>Welcome Back</h1>
          <p>Sign in to your Campus Connect account</p>
        </div>

        {/* Role selector */}
        <div className="auth-roles">
          {ROLES.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              className={`auth-role-pill ${role === key ? `active ${accent}` : ''}`}
              onClick={() => { setRole(key); setError(''); }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>{isRecruiter ? 'Email Address' : 'Email or Student ID'}</label>
            <input
              className={accent}
              type="text"
              placeholder={isRecruiter ? 'hr@company.com' : 'Enter email or student ID'}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <PasswordInput
              className={accent}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`auth-btn ${accent}`} disabled={loading}>
            {loading ? 'Signing in…' : `Sign In as ${ROLES.find(r => r.key === role).label}`}
          </button>
        </form>

        <div className="auth-footer">
          {role === 'recruiter' ? (
            <>Don't have an account? <Link to="/recruiter/signup" className="orange">Recruiter Sign Up</Link></>
          ) : role === 'teacher' ? (
            <>Don't have an account? <Link to="/teacher/signup" className="blue">Teacher Sign Up</Link></>
          ) : (
            <>Don't have an account? <Link to="/student/signup" className="blue">Student Sign Up</Link></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
