import './StudentSignup.css?v=3';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signUp } from '../../api/auth';
import { saveStudentProfile } from '../../api/profiles';

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

function StudentSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    student_id: '', phone: '', department: '', year: '', semester: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.student_id.trim()) return 'Student ID is required';
    if (!/^\d{10}$/.test(formData.phone)) return 'Phone must be 10 digits';
    if (!formData.department) return 'Department is required';
    if (!formData.year) return 'Year is required';
    if (!formData.semester) return 'Semester is required';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const data = await signUp(formData.student_id, formData.email, formData.password, {
        name: formData.name, phone: formData.phone,
        department: formData.department, year: parseInt(formData.year),
        semester: parseInt(formData.semester)
      });
      localStorage.setItem('token', data.token);
      const studentData = {
        student_id: formData.student_id,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester)
      };
      localStorage.setItem('currentStudent', JSON.stringify(studentData));
      await saveStudentProfile(formData.student_id, studentData);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" style={{ maxWidth: '480px' }}>
        <button className="back-btn" onClick={() => step === 2 ? setStep(1) : navigate('/')}>←</button>

        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Step {step} of 2 — {step === 1 ? 'Account Details' : 'Academic Info'}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            <div style={{ height: '4px', width: '60px', borderRadius: '2px', background: '#3b82f6' }}></div>
            <div style={{ height: '4px', width: '60px', borderRadius: '2px', background: step === 2 ? '#3b82f6' : 'rgba(255,255,255,0.15)' }}></div>
          </div>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '12px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        {step === 1 ? (
          <div className="signup-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Rahul Sharma" value={formData.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="student@kdkce.edu.in" value={formData.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={formData.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>
            <button type="button" className="signup-btn" onClick={handleNext}>Next →</button>
          </div>
        ) : (
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Student ID</label>
              <input type="text" placeholder="e.g. KF23CS164" value={formData.student_id} onChange={e => set('student_id', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="10-digit mobile number" value={formData.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={formData.department} onChange={e => set('department', e.target.value)} required>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Year</label>
                <select value={formData.year} onChange={e => { set('year', e.target.value); set('semester', ''); }} required>
                  <option value="">Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select value={formData.semester} onChange={e => set('semester', e.target.value)} required>
                  <option value="">Semester</option>
                  {formData.year && [1, 2].map(s => {
                    const sem = (parseInt(formData.year) - 1) * 2 + s;
                    return <option key={sem} value={sem}>Sem {sem}</option>;
                  })}
                </select>
              </div>
            </div>
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="student-signin-link">
          Already have an Account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentSignup;
