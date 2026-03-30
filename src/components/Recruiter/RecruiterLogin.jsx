import './RecruiterLogin.css?v=2';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API_BASE from '../../api/config';

function RecruiterLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({email: '', password: ''});
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/recruiter/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentRecruiter', JSON.stringify(data.recruiter));
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="recruiter-login-page">
      <div className="recruiter-login-card">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>Welcome Back !!</h1>
        <p>Sign in to your Smart Campus Account</p>
        <form onSubmit={handleSubmit}>
          {error && <div style={{color: '#ef4444', marginBottom: '16px', textAlign: 'center'}}>{error}</div>}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="signin-btn">Sign In</button>
        </form>
        <div className="signup-text">
          Don't have an Account? <Link to="/recruiter/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterLogin;
