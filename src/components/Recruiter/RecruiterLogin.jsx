import '../auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API_BASE from '../../api/config';
import PasswordInput from '../PasswordInput';

function RecruiterLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recruiter/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentRecruiter', JSON.stringify(data.recruiter));
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page orange">
      <div className="auth-card orange">
        <button className="auth-back" onClick={() => navigate('/')}>←</button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/img/smartCampusLogo.png" alt="Logo" />
          </div>
          <span className="auth-logo-name">Campus Connect</span>
        </div>

        <div className="auth-header">
          <h1 className="orange">Recruiter Login</h1>
          <p>Sign in to your recruiter portal</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              className="orange"
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <PasswordInput className="orange" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="auth-btn orange" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/recruiter/signup" className="orange">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterLogin;
