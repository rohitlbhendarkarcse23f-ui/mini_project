import React, { useState } from 'react';
import './MarksheetUpload.css';
import { uploadFile, saveMarksheets } from '../../api/profiles';

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0 };

function calculateSGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0;
  let totalCredits = 0, totalPoints = 0;
  for (const s of subjects) {
    const gp = GRADE_POINTS[s.grade] || 0;
    totalPoints += gp * (s.credits || 0);
    totalCredits += s.credits || 0;
  }
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function saveToLocalStorage(sid, email, name, semester, sgpa, subjects) {
  const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
  const current = profiles[sid] || {};
  const sgpaList = [...(current.sgpaList || [])];
  sgpaList[semester - 1] = sgpa;
  const semesterData = { ...(current.semesterData || {}), [semester]: subjects };
  const valid = sgpaList.filter(v => v != null);
  const cgpa = valid.length > 0 ? parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)) : sgpa;
  profiles[sid] = { ...current, name, student_id: sid, cgpa, sgpaList, semesterData, lastUpdated: new Date().toISOString() };
  localStorage.setItem('studentProfiles', JSON.stringify(profiles));

  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const idx = students.findIndex(s => s.student_id === sid);
  const entry = { student_id: sid, email, name, sgpaList, semesterData, cgpa, semester };
  if (idx >= 0) students[idx] = { ...students[idx], ...entry };
  else students.push(entry);
  localStorage.setItem('students', JSON.stringify(students));
  window.dispatchEvent(new Event('storage'));
  return cgpa;
}

const MarksheetUpload = ({ onDataExtracted, currentSemesterOverride }) => {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const currentSemester = currentSemesterOverride || parseInt(student.semester) || 1;
  const maxAllowed = currentSemester - 1; // only previous semesters
  const [mode, setMode] = useState('manual'); // 'manual' | 'file'
  const [semester, setSemester] = useState(maxAllowed >= 1 ? maxAllowed : 1);
  const [subjects, setSubjects] = useState([{ name: '', credits: 3, grade: 'A' }]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addSubject = () => setSubjects(p => [...p, { name: '', credits: 3, grade: 'A' }]);
  const removeSubject = (i) => subjects.length > 1 && setSubjects(p => p.filter((_, idx) => idx !== i));
  const updateSubject = (i, field, val) => {
    const updated = [...subjects];
    updated[i] = { ...updated[i], [field]: field === 'credits' ? parseInt(val) || 0 : val };
    setSubjects(updated);
  };

  const sgpa = parseFloat(calculateSGPA(subjects).toFixed(2));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only PDF or image files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return; }
    setUploadedFile(file);
  };

  const handleSaveManual = async () => {
    const sid = student.student_id;
    const name = student.name || student.email?.split('@')[0] || sid;
    if (!sid) { alert('Student session not found. Please log in again.'); return; }
    const emptySubject = subjects.find(s => !s.name.trim());
    if (emptySubject) { alert('Please fill in all subject names'); return; }

    setSaving(true);
    try {
      const cgpa = saveToLocalStorage(sid, student.email, name, semester, sgpa, subjects);

      // Save to API — send full marksheet array + sgpaList + cgpa + semesterData
      const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
      const profile = profiles[sid] || {};
      const marksheetArray = Object.entries(profile.semesterData || {}).map(([sem, subs]) => ({
        semester: parseInt(sem),
        sgpa: profile.sgpaList?.[parseInt(sem) - 1] || 0,
        subjects: subs
      }));
      const { saveStudentProfile } = await import('../../api/profiles');
      await Promise.all([
        saveMarksheets(sid, marksheetArray).catch(() => {}),
        saveStudentProfile(sid, {
          cgpa,
          sgpaList: profile.sgpaList,
          semesterData: profile.semesterData,
          semester,
          name,
          email: student.email,
          department: student.department || ''
        }).catch(() => {})
      ]);

      onDataExtracted({ semester, sgpa, subjects, studentId: sid, name });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFile = async () => {
    const sid = student.student_id;
    if (!sid) { alert('Student session not found. Please log in again.'); return; }
    if (!uploadedFile) { alert('Please select a file first'); return; }

    setUploading(true);
    try {
      const result = await uploadFile(uploadedFile, 'marksheet');
      const fileUrl = result.url;

      // Save file reference with semester info
      saveToLocalStorage(sid, student.email, student.name || student.email?.split('@')[0], semester, 0, []);

      const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
      const profile = profiles[sid] || {};
      const marksheetArray = Object.entries(profile.semesterData || {}).map(([sem, subs]) => ({
        semester: parseInt(sem), sgpa: profile.sgpaList?.[parseInt(sem) - 1] || 0, subjects: subs
      }));
      marksheetArray.push({ semester, sgpa: 0, subjects: [], file_url: fileUrl });
      await saveMarksheets(sid, marksheetArray).catch(() => {});

      onDataExtracted({ semester, sgpa: 0, subjects: [], studentId: sid, fileUrl });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px' };
  const tabStyle = (active) => ({ padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: active ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.05)', color: active ? 'white' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' });

  return (
    <div className="marksheet-upload-container">
      <div className="upload-header">
        <h2>📋 Marksheet Entry</h2>
        <p>Semester {semester} · {student.name || student.email?.split('@')[0] || student.student_id}</p>
      </div>

      {/* Semester selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'rgba(59,130,246,0.08)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
        <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600', whiteSpace: 'nowrap' }}>Select Semester:</label>
        {maxAllowed >= 1 ? (
          <>
            <select value={semester} onChange={e => setSemester(parseInt(e.target.value))} style={{ ...inputStyle, width: 'auto', minWidth: '140px' }}>
              {Array.from({length: maxAllowed}, (_, i) => i + 1).map(s => (
                <option key={s} value={s} style={{ background: '#1a1d2e' }}>Semester {s}</option>
              ))}
            </select>
            <span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>Only completed semesters (before Sem {currentSemester})</span>
          </>
        ) : (
          <span style={{fontSize:'13px',color:'rgba(245,158,11,0.9)'}}>⚠️ No previous semesters available. You are in Semester 1.</span>
        )}
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button style={tabStyle(mode === 'manual')} onClick={() => setMode('manual')}>✏️ Manual Entry</button>
        <button style={tabStyle(mode === 'file')} onClick={() => setMode('file')}>📎 Upload File</button>
      </div>

      {mode === 'manual' ? (
        <div className="extracted-data-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ color: '#3b82f6' }}>📚 Subjects & Grades</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '18px' }}>SGPA: {sgpa.toFixed(2)}</span>
              <button onClick={addSubject} className="edit-toggle-btn">➕ Add Subject</button>
            </div>
          </div>

          <div className="subjects-table-wrapper">
            <table className="subjects-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Credits</th>
                  <th>Grade</th>
                  <th>Points</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, i) => (
                  <tr key={i}>
                    <td><input type="text" placeholder="e.g. Data Structures" value={subject.name} onChange={e => updateSubject(i, 'name', e.target.value)} /></td>
                    <td><input type="number" min="1" max="6" value={subject.credits} onChange={e => updateSubject(i, 'credits', e.target.value)} style={{ width: '60px' }} /></td>
                    <td>
                      <select value={subject.grade} onChange={e => updateSubject(i, 'grade', e.target.value)}>
                        {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#22c55e' }}>{GRADE_POINTS[subject.grade]}</td>
                    <td style={{ textAlign: 'center' }}>
                      {subjects.length > 1 && <button onClick={() => removeSubject(i)} className="retry-btn" style={{ padding: '4px 8px', fontSize: '12px' }}>🗑️</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons" style={{ marginTop: '24px' }}>
            <button onClick={handleSaveManual} className="save-btn" disabled={saving}>
              {saving ? '⏳ Saving...' : `💾 Save Semester ${semester} Data`}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '32px', border: '2px dashed rgba(59,130,246,0.4)', borderRadius: '16px', textAlign: 'center', background: 'rgba(59,130,246,0.04)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px', fontSize: '14px' }}>
              Upload your marksheet PDF or image (max 5MB)
            </p>
            <label style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: 'white', fontSize: '14px' }}>
              Choose File
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {uploadedFile && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '14px' }}>
                ✅ {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>

          <div style={{ padding: '16px', background: 'rgba(245,158,11,0.08)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            ⚠️ File upload stores your marksheet for reference. For SGPA calculation used in merit ranking, please also use Manual Entry.
          </div>

          <button onClick={handleSaveFile} className="save-btn" disabled={!uploadedFile || uploading}>
            {uploading ? '⏳ Uploading...' : `📤 Upload Semester ${semester} Marksheet`}
          </button>
        </div>
      )}
    </div>
  );
};

export { calculateSGPA, GRADE_POINTS };
export default MarksheetUpload;
