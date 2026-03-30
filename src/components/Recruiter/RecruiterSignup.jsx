import './RecruiterSignup.css?v=4';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API_BASE from '../../api/config';

function RecruiterSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({company: '', email: '', phone: '', website: '', industry: '', role: '', password: '', confirmPassword: ''});
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/recruiter/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formData.company, email: formData.email, phone: formData.phone,
          website: formData.website, industry: formData.industry, role: formData.role,
          password: formData.password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentRecruiter', JSON.stringify(data.recruiter));
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="recruiter-signup-page">
      <div className="recruiter-signup-card">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <div className="recruiter-header">
          <h1>Create Account</h1>
          <p>Sign Up to your Smart Campus Account</p>
        </div>
        <form className="recruiter-form" onSubmit={handleSubmit}>
          {error && <div style={{color: '#ef4444', marginBottom: '16px', textAlign: 'center'}}>{error}</div>}
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" placeholder="Enter company name" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Official Email</label>
            <input type="email" placeholder="company@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Company Website</label>
            <input type="url" placeholder="https://company.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} required>
              <option value="">Select Industry</option>
              <option value="tech">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Hiring Role / Position</label>
            <input type="text" placeholder="e.g., Software Engineer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a strong password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
          </div>
          <button type="submit" className="recruiter-signup-btn">Create Recruiter Account</button>
        </form>
        <div className="recruiter-signin-link">
          Already have an account? <Link to="/recruiter/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterSignup;
