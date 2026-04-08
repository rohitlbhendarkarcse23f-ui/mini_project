import React, { useState } from 'react';
import { parseMarksheet } from '../../utils/aiMarksheetExtractor';
import { saveMarksheets, saveStudentProfile } from '../../api/profiles';
import './MarksheetUpload.css';

const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6,
  'C': 5, 'D': 4, 'E': 3, 'F': 0
};

function saveToLocalStorage(sid, email, name, semester, sgpa, subjects) {
  const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
  const current = profiles[sid] || {};
  const sgpaList = [...(current.sgpaList || [])];
  sgpaList[semester - 1] = sgpa;
  const semesterData = { ...(current.semesterData || {}), [semester]: subjects };
  const valid = sgpaList.filter(v => v != null && v > 0);
  const cgpa = valid.length > 0 ? parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)) : sgpa;
  profiles[sid] = { ...current, name, student_id: sid, cgpa, sgpaList, semesterData, lastUpdated: new Date().toISOString() };
  localStorage.setItem('studentProfiles', JSON.stringify(profiles));
  window.dispatchEvent(new Event('storage'));
  return { cgpa, sgpaList, semesterData };
}

const AIMarksheetUpload = ({ onDataExtracted }) => {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
    setFile(selectedFile);
    setExtractedData(null);
  };

  const handleExtract = async () => {
    if (!file) { alert('Please select a file'); return; }
    setProcessing(true);
    try {
      const result = await parseMarksheet(file, (p) => console.log(p.message));
      if (result.success) {
        // Pre-fill student info from session if not extracted
        const data = { ...result.data };
        if (!data.studentId || data.studentId === 'UNKNOWN') data.studentId = student.student_id || '';
        if (!data.studentName) data.studentName = student.name || student.email?.split('@')[0] || '';
        setExtractedData(data);
        setConfidence(result.confidence || 0);
      } else {
        alert(`Extraction failed: ${result.errors.join(', ')}\n\nMake sure the Docling service is running on port 5001, or use Manual Entry instead.`);
      }
    } catch (err) {
      alert(`Error: ${err.message}\n\nPlease try manual entry instead.`);
    } finally {
      setProcessing(false);
    }
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...extractedData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: field === 'credits' ? parseInt(value) || 0 : value };
    let totalCredits = 0, totalGradePoints = 0;
    newSubjects.forEach(sub => {
      const gp = GRADE_POINTS[sub.grade] || 0;
      const cr = parseInt(sub.credits) || 0;
      totalGradePoints += gp * cr;
      totalCredits += cr;
    });
    setExtractedData({ ...extractedData, subjects: newSubjects, sgpa: parseFloat((totalCredits > 0 ? totalGradePoints / totalCredits : 0).toFixed(2)) });
  };

  const handleSave = async () => {
    const sid = student.student_id;
    if (!sid) { alert('Student session not found. Please log in again.'); return; }
    setSaving(true);
    try {
      const { semester, sgpa, subjects, studentName } = extractedData;
      const name = studentName || student.name || student.email?.split('@')[0] || sid;
      const { cgpa, sgpaList, semesterData } = saveToLocalStorage(sid, student.email, name, semester, sgpa, subjects);

      const marksheetArray = Object.entries(semesterData).map(([sem, subs]) => ({
        semester: parseInt(sem),
        sgpa: sgpaList[parseInt(sem) - 1] || 0,
        subjects: subs
      }));

      await Promise.all([
        saveMarksheets(sid, marksheetArray).catch(() => {}),
        saveStudentProfile(sid, { cgpa, sgpaList, semesterData, semester, name, email: student.email, department: student.department || '' }).catch(() => {})
      ]);

      onDataExtracted({ semester, sgpa, subjects, studentId: sid, name });
      setFile(null);
      setExtractedData(null);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const confidenceColor = confidence >= 75 ? '#22c55e' : confidence >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="marksheet-upload-container">
      <div className="upload-header">
        <h2>🤖 AI Marksheet Extraction</h2>
        <p>Upload your marksheet — AI will automatically extract subjects, grades & SGPA</p>
      </div>

      {!extractedData && (
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input type="file" id="marksheet-file" accept="image/*,.pdf" onChange={handleFileSelect} className="file-input" />
            <label htmlFor="marksheet-file" className="file-label">📁 Choose Marksheet (Image / PDF, max 10MB)</label>
          </div>

          {file && (
            <div className="selected-files">
              <h4>Selected:</h4>
              <p>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            </div>
          )}

          <button onClick={handleExtract} disabled={processing || !file} className="extract-btn">
            {processing ? <><span className="spinner-small"></span> AI is analyzing your marksheet...</> : '🔍 Extract with AI'}
          </button>

          <div className="info-box">
            <h4>📋 How it works:</h4>
            <ul>
              <li>Upload a clear image or PDF of your marksheet</li>
              <li>AI (Docling OCR) extracts subjects, credits & grades automatically</li>
              <li>Review and correct any errors before saving</li>
              <li>SGPA is calculated and saved for merit ranking</li>
            </ul>
            <p style={{marginTop:'12px',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>⚠️ Requires Docling service running on port 5001. If unavailable, use Manual Entry.</p>
          </div>
        </div>
      )}

      {extractedData && (
        <div className="extracted-data-section">
          <div className="section-header">
            <h3>✅ Extraction Complete</h3>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'13px',color:confidenceColor,fontWeight:'600'}}>Confidence: {confidence}%</span>
              <button onClick={() => setEditMode(!editMode)} className="edit-toggle-btn">
                {editMode ? '👁️ View' : '✏️ Edit'}
              </button>
            </div>
          </div>

          <div className="student-info-card">
            {[['Student ID', 'studentId'], ['Name', 'studentName'], ['Branch', 'branch']].map(([label, key]) => (
              <div key={key} className="info-row">
                <label>{label}:</label>
                {editMode
                  ? <input type="text" value={extractedData[key] || ''} onChange={e => setExtractedData({...extractedData, [key]: e.target.value})} />
                  : <span>{extractedData[key] || '—'}</span>}
              </div>
            ))}
            <div className="info-row">
              <label>Semester:</label>
              {editMode
                ? <input type="number" min="1" max="8" value={extractedData.semester} onChange={e => setExtractedData({...extractedData, semester: parseInt(e.target.value)})} style={{width:'80px'}} />
                : <span>{extractedData.semester}</span>}
            </div>
            <div className="info-row sgpa-row">
              <label>Calculated SGPA:</label>
              <span className="sgpa-value">{extractedData.sgpa.toFixed(2)}</span>
            </div>
          </div>

          <div className="subjects-table-wrapper">
            <h4>📚 Subjects & Grades ({extractedData.subjects.length} subjects)</h4>
            <table className="subjects-table">
              <thead>
                <tr><th>Code</th><th>Subject Name</th><th>Credits</th><th>Grade</th><th>Points</th></tr>
              </thead>
              <tbody>
                {extractedData.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td>{editMode ? <input type="text" value={subject.code} onChange={e => updateSubject(index,'code',e.target.value)} /> : subject.code}</td>
                    <td>{editMode ? <input type="text" value={subject.name} onChange={e => updateSubject(index,'name',e.target.value)} /> : subject.name}</td>
                    <td>{editMode ? <input type="number" min="1" max="6" value={subject.credits} onChange={e => updateSubject(index,'credits',e.target.value)} style={{width:'60px'}} /> : subject.credits}</td>
                    <td>{editMode
                      ? <select value={subject.grade} onChange={e => updateSubject(index,'grade',e.target.value)}>
                          {Object.keys(GRADE_POINTS).map(g => <option key={g}>{g}</option>)}
                        </select>
                      : <span className="grade-badge">{subject.grade}</span>}
                    </td>
                    <td style={{textAlign:'center',fontWeight:'bold',color:'#22c55e'}}>{GRADE_POINTS[subject.grade] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button onClick={handleSave} className="save-btn" disabled={saving}>
              {saving ? '⏳ Saving...' : `💾 Save Semester ${extractedData.semester} Data`}
            </button>
            <button onClick={() => { setFile(null); setExtractedData(null); setEditMode(false); }} className="cancel-btn">🔄 Upload Another</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMarksheetUpload;
