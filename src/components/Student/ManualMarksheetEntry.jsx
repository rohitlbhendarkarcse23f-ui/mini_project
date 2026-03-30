import React, { useState } from 'react';
import { calculateSGPA, GRADE_POINTS } from '../../utils/marksheetExtractor';
import './MarksheetUpload.css';

const ManualMarksheetEntry = ({ onDataSaved }) => {
  const [semester, setSemester] = useState(1);
  const [subjects, setSubjects] = useState([
    { code: '', name: '', credits: 3, grade: 'A' }
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { code: '', name: '', credits: 3, grade: 'A' }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleSave = () => {
    const sgpa = calculateSGPA(subjects);
    
    const data = {
      semester,
      subjects,
      sgpa: parseFloat(sgpa.toFixed(2))
    };

    onDataSaved(data);
    
    // Reset form
    setSemester(semester + 1);
    setSubjects([{ code: '', name: '', credits: 3, grade: 'A' }]);
  };

  const calculatedSGPA = calculateSGPA(subjects);

  return (
    <div className="marksheet-upload-container">
      <div className="upload-header">
        <h2>📝 Manual Marksheet Entry</h2>
        <p>Enter your semester grades manually</p>
      </div>

      <div className="student-info-card">
        <div className="info-row">
          <label>Semester:</label>
          <input
            type="number"
            min="1"
            max="8"
            value={semester}
            onChange={(e) => setSemester(parseInt(e.target.value))}
            style={{ width: '100px' }}
          />
        </div>
      </div>

      <div className="subjects-table-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4>📚 Subjects & Grades</h4>
          <button onClick={addSubject} className="add-subject-btn">
            ➕ Add Subject
          </button>
        </div>

        <table className="subjects-table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Grade Points</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    placeholder="CS101"
                    value={subject.code}
                    onChange={(e) => updateSubject(index, 'code', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Data Structures"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subject.credits}
                    onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value))}
                    style={{ width: '60px' }}
                  />
                </td>
                <td>
                  <select
                    value={subject.grade}
                    onChange={(e) => updateSubject(index, 'grade', e.target.value)}
                  >
                    <option value="O">O (Outstanding)</option>
                    <option value="A+">A+ (Excellent)</option>
                    <option value="A">A (Very Good)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Above Average)</option>
                    <option value="C">C (Average)</option>
                    <option value="D">D (Pass)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#22c55e' }}>
                  {GRADE_POINTS[subject.grade]}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => removeSubject(index)}
                      className="remove-subject-btn"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="student-info-card sgpa-card-manual">
        <div className="info-row sgpa-row">
          <label>Calculated SGPA:</label>
          <span className="sgpa-value">{calculatedSGPA.toFixed(2)}</span>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px', textAlign: 'center' }}>
          Formula: Σ(Grade Points × Credits) / Σ(Credits)
        </p>
      </div>

      <div className="action-buttons">
        <button onClick={handleSave} className="save-btn">
          💾 Save Semester {semester} Data
        </button>
      </div>

      <div className="info-box" style={{ marginTop: '24px' }}>
        <h4>📋 Grade Scale:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
          {Object.entries(GRADE_POINTS).map(([grade, points]) => (
            <div key={grade} style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '8px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <strong style={{ color: '#3b82f6' }}>{grade}</strong>
              <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.7)' }}>= {points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualMarksheetEntry;
