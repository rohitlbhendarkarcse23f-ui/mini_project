import '../auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API_BASE from '../../api/config';
import PasswordInput from '../PasswordInput';

const INDUSTRIES = ['Technology','Finance','Healthcare','Education','Manufacturing','Retail','Other'];

function RecruiterSignup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('new');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newForm, setNewForm] = useState({
    company: '', email: '', phone: '', website: '',
    industry: '', role: '', password: '', confirmPassword: '',
  });

  const [joinForm, setJoinForm] = useState({
    company_id: '', email: '', phone: '', role: '', password: '', confirmPassword: '',
  });

  const setNew  = (f, v) => setNewForm(p => ({ ...p, [f]: v }));
  const setJoin = (f, v) => setJoinForm(p => ({ ...p, [f]: v }));

  const handleNewCompany = async (e) => {
    e.preventDefault();
    if (newForm.password !== newForm.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/recruiter/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: newForm.company, email: newForm.email, phone: newForm.phone,
          website: newForm.website, industry: newForm.industry,
          role: newForm.role, password: newForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentRecruiter', JSON.stringify(data.recruiter));
      navigate('/recruiter/dashboard');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleJoinCompany = async (e) => {
    e.preventDefault();
    if (joinForm.password !== joinForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (!joinForm.company_id.trim()) { setError('Company code is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/recruiter/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: joinForm.company_id.trim(),
          email: joinForm.email, phone: joinForm.phone,
          role: joinForm.role, password: joinForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Join failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentRecruiter', JSON.stringify(data.recruiter));
      navigate('/recruiter/dashboard');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="auth-page orange">
      <div className="auth-card orange wide">
        <button className="auth-back" onClick={() => navigate('/')}>←</button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/img/smartCampusLogo.png" alt="Logo" />
          </div>
          <span className="auth-logo-name">Campus Connect</span>
        </div>

        <div className="auth-header">
          <h1 className="orange">Recruiter Sign Up</h1>
          <p>Join the Campus Connect recruiter portal</p>
        </div>

        {/* Mode toggle */}
        <div className="auth-toggle">
          <button type="button" className={`auth-toggle-btn ${mode === 'new' ? 'active' : ''}`} onClick={() => { setMode('new'); setError(''); }}>
            🏢 New Company
          </button>
          <button type="button" className={`auth-toggle-btn ${mode === 'join' ? 'active' : ''}`} onClick={() => { setMode('join'); setError(''); }}>
            👥 Join Company
          </button>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

        {mode === 'new' ? (
          <form className="auth-form" onSubmit={handleNewCompany}>
            <div className="auth-field">
              <label>Company Name *</label>
              <input className="orange" type="text" placeholder="Acme Corp" value={newForm.company} onChange={e => setNew('company', e.target.value)} required />
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Official Email *</label>
                <input className="orange" type="email" placeholder="hr@company.com" value={newForm.email} onChange={e => setNew('email', e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Phone *</label>
                <input className="orange" type="tel" placeholder="+91 9876543210" value={newForm.phone} onChange={e => setNew('phone', e.target.value)} required />
              </div>
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Industry *</label>
                <select className="orange" value={newForm.industry} onChange={e => setNew('industry', e.target.value)} required>
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="auth-field">
                <label>Your Role *</label>
                <input className="orange" type="text" placeholder="e.g. HR Manager" value={newForm.role} onChange={e => setNew('role', e.target.value)} required />
              </div>
            </div>
            <div className="auth-field">
              <label>Company Website</label>
              <input className="orange" type="url" placeholder="https://company.com" value={newForm.website} onChange={e => setNew('website', e.target.value)} />
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Password *</label>
                <PasswordInput className="orange" placeholder="Create password" value={newForm.password} onChange={e => setNew('password', e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Confirm Password *</label>
                <PasswordInput className="orange" placeholder="Re-enter password" value={newForm.confirmPassword} onChange={e => setNew('confirmPassword', e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="auth-btn orange" disabled={loading}>
              {loading ? 'Registering…' : 'Register Company'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleJoinCompany}>
            <div className="auth-field">
              <label>Company Code *</label>
              <input className="orange" type="text" placeholder="e.g. CMP1748123456789" value={joinForm.company_id} onChange={e => setJoin('company_id', e.target.value)} required />
              <span className="auth-field-hint">Ask your company admin for the code from their profile page.</span>
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Your Email *</label>
                <input className="orange" type="email" placeholder="you@company.com" value={joinForm.email} onChange={e => setJoin('email', e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Phone</label>
                <input className="orange" type="tel" placeholder="+91 9876543210" value={joinForm.phone} onChange={e => setJoin('phone', e.target.value)} />
              </div>
            </div>
            <div className="auth-field">
              <label>Your Role *</label>
              <input className="orange" type="text" placeholder="e.g. Technical Recruiter" value={joinForm.role} onChange={e => setJoin('role', e.target.value)} required />
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Password *</label>
                <PasswordInput className="orange" placeholder="Create password" value={joinForm.password} onChange={e => setJoin('password', e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Confirm Password *</label>
                <PasswordInput className="orange" placeholder="Re-enter password" value={joinForm.confirmPassword} onChange={e => setJoin('confirmPassword', e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="auth-btn orange" disabled={loading}>
              {loading ? 'Joining…' : 'Join Company'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/recruiter/login" className="orange">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterSignup;
