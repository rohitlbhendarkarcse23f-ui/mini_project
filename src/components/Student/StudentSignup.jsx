import '../auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signUp } from '../../api/auth';
import { saveStudentProfile } from '../../api/profiles';
import PasswordInput from '../PasswordInput';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Other',
];

function StudentSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    student_id: '', phone: '', department: '', year: '', semester: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Full name is required';
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
        department: formData.department,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
      });
      localStorage.setItem('token', data.token);
      const studentData = {
        student_id: formData.student_id, email: formData.email,
        name: formData.name, phone: formData.phone,
        department: formData.department,
        year: parseInt(formData.year), semester: parseInt(formData.semester),
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
    <div className="auth-page blue">
      <div className="auth-card blue wide">
        <button className="auth-back" onClick={() => step === 2 ? (setStep(1), setError('')) : navigate('/')}>←</button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/img/smartCampusLogo.png" alt="Logo" />
          </div>
          <span className="auth-logo-name">Campus Connect</span>
        </div>

        <div className="auth-header">
          <h1 className="blue">Student Sign Up</h1>
          <p>Create your Campus Connect student account</p>
        </div>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className="auth-step">
            <div className={`auth-step-num ${step >= 1 ? 'done' : 'idle'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`auth-step-label ${step === 1 ? 'active' : ''}`}>Account</span>
          </div>
          <div className={`auth-step-line ${step > 1 ? 'done' : ''}`} />
          <div className="auth-step">
            <div className={`auth-step-num ${step === 2 ? 'active' : 'idle'}`}>2</div>
            <span className={`auth-step-label ${step === 2 ? 'active' : ''}`}>Academic Info</span>
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

        {step === 1 ? (
          <div className="auth-form">
            <div className="auth-field">
              <label>Full Name</label>
              <input className="blue" type="text" placeholder="Rahul Sharma" value={formData.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Email Address</label>
              <input className="blue" type="email" placeholder="student@kdkce.edu.in" value={formData.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <PasswordInput className="blue" placeholder="Min. 6 characters" value={formData.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Confirm Password</label>
              <PasswordInput className="blue" placeholder="Re-enter password" value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
            </div>
            <button type="button" className="auth-btn blue" onClick={handleNext}>Continue →</button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Student ID</label>
              <input className="blue" type="text" placeholder="e.g. KF23CS164" value={formData.student_id} onChange={e => set('student_id', e.target.value)} required />
            </div>
            <div className="auth-field">
              <label>Phone Number</label>
              <input className="blue" type="tel" placeholder="10-digit mobile number" value={formData.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="auth-field">
              <label>Department</label>
              <select className="blue" value={formData.department} onChange={e => set('department', e.target.value)} required>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Year</label>
                <select className="blue" value={formData.year} onChange={e => { set('year', e.target.value); set('semester', ''); }} required>
                  <option value="">Year</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>{y}{['st','nd','rd','th'][y-1]} Year</option>)}
                </select>
              </div>
              <div className="auth-field">
                <label>Semester</label>
                <select className="blue" value={formData.semester} onChange={e => set('semester', e.target.value)} required>
                  <option value="">Semester</option>
                  {formData.year && [1,2].map(s => {
                    const sem = (parseInt(formData.year) - 1) * 2 + s;
                    return <option key={sem} value={sem}>Sem {sem}</option>;
                  })}
                </select>
              </div>
            </div>
            <button type="submit" className="auth-btn blue" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="blue">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentSignup;
