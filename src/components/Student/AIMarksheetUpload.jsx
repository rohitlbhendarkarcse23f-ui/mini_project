import React, { useState } from 'react';
import { parseMarksheet } from '../../utils/aiMarksheetExtractor';
import './MarksheetUpload.css';

const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6,
  'C': 5, 'D': 4, 'E': 3, 'F': 0
};

const AIMarksheetUpload = ({ onDataExtracted }) => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setProcessing(true);

    try {
      const result = await parseMarksheet(file, (p) => console.log(p.message));
      
      if (result.success) {
        setExtractedData(result.data);
      } else {
        const errorMsg = result.errors.join(', ');
        console.error('Extraction error:', errorMsg);
        alert(`AI Extraction failed: ${errorMsg}\n\nPlease try:\n1. Using a clearer image\n2. Checking your internet connection\n3. Verifying the API key is valid\n\nOr use manual entry instead.`);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert(`Error: ${error.message}\n\nPlease try manual entry instead.`);
    } finally {
      setProcessing(false);
    }
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...extractedData.subjects];
    newSubjects[index][field] = value;
    
    // Recalculate SGPA
    let totalCredits = 0;
    let totalGradePoints = 0;
    newSubjects.forEach(sub => {
      const gp = GRADE_POINTS[sub.grade] || 0;
      const cr = parseInt(sub.credits) || 0;
      totalGradePoints += gp * cr;
      totalCredits += cr;
    });
    const newSGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    setExtractedData({
      ...extractedData,
      subjects: newSubjects,
      sgpa: parseFloat(newSGPA.toFixed(2))
    });
  };

  const handleSave = () => {
    onDataExtracted(extractedData);
    setFile(null);
    setExtractedData(null);
    setEditMode(false);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setEditMode(false);
  };

  return (
    <div className="marksheet-upload-container">
      <div className="upload-header">
        <h2>🔍 OCR Marksheet Upload</h2>
        <p>Upload your marksheet and OCR will automatically extract all data</p>
      </div>

      {!extractedData && (
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="marksheet-file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="marksheet-file" className="file-label">
              📁 Choose Marksheet (Image/PDF)
            </label>
          </div>

          {file && (
            <div className="selected-files">
              <h4>Selected File:</h4>
              <p>{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={processing || !file}
            className="extract-btn"
          >
            {processing ? (
              <>
                <span className="spinner-small"></span>
                OCR is analyzing your marksheet...
              </>
            ) : (
              '🔍 Extract Data with OCR'
            )}
          </button>

          <div className="info-box">
            <h4>📋 How it works:</h4>
            <ul>
              <li>Upload a clear image or PDF of your marksheet</li>
              <li>OCR automatically extracts student info, subjects, and grades</li>
              <li>Review and edit the extracted data if needed</li>
              <li>SGPA is calculated automatically</li>
              <li>Data is saved for merit ranking</li>
            </ul>
            <p style={{marginTop: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '14px'}}>
              💡 Tip: If AI extraction fails, you can manually enter your data instead.
            </p>
          </div>
        </div>
      )}

      {extractedData && (
        <div className="extracted-data-section">
          <div className="section-header">
            <h3>✅ Data Extracted Successfully</h3>
            <button onClick={() => setEditMode(!editMode)} className="edit-toggle-btn">
              {editMode ? '👁️ View Mode' : '✏️ Edit Mode'}
            </button>
          </div>

          <div className="student-info-card">
            <div className="info-row">
              <label>Student ID:</label>
              {editMode ? (
                <input
                  type="text"
                  value={extractedData.studentId}
                  onChange={(e) => setExtractedData({...extractedData, studentId: e.target.value})}
                />
              ) : (
                <span>{extractedData.studentId}</span>
              )}
            </div>

            <div className="info-row">
              <label>Name:</label>
              {editMode ? (
                <input
                  type="text"
                  value={extractedData.studentName}
                  onChange={(e) => setExtractedData({...extractedData, studentName: e.target.value})}
                />
              ) : (
                <span>{extractedData.studentName}</span>
              )}
            </div>

            <div className="info-row">
              <label>Semester:</label>
              {editMode ? (
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={extractedData.semester}
                  onChange={(e) => setExtractedData({...extractedData, semester: parseInt(e.target.value)})}
                  style={{ width: '100px' }}
                />
              ) : (
                <span>{extractedData.semester}</span>
              )}
            </div>

            <div className="info-row">
              <label>Branch:</label>
              {editMode ? (
                <input
                  type="text"
                  value={extractedData.branch}
                  onChange={(e) => setExtractedData({...extractedData, branch: e.target.value})}
                />
              ) : (
                <span>{extractedData.branch}</span>
              )}
            </div>

            <div className="info-row sgpa-row">
              <label>Calculated SGPA:</label>
              <span className="sgpa-value">{extractedData.sgpa.toFixed(2)}</span>
            </div>
          </div>

          <div className="subjects-table-wrapper">
            <h4>📚 Subjects & Grades</h4>
            <table className="subjects-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Credits</th>
                  <th>Grade</th>
                  <th>Grade Points</th>
                </tr>
              </thead>
              <tbody>
                {extractedData.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td>
                      {editMode ? (
                        <input
                          type="text"
                          value={subject.code}
                          onChange={(e) => updateSubject(index, 'code', e.target.value)}
                        />
                      ) : (
                        subject.code
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(index, 'name', e.target.value)}
                        />
                      ) : (
                        subject.name
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={subject.credits}
                          onChange={(e) => updateSubject(index, 'credits', e.target.value)}
                          style={{ width: '60px' }}
                        />
                      ) : (
                        subject.credits
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <select
                          value={subject.grade}
                          onChange={(e) => updateSubject(index, 'grade', e.target.value)}
                        >
                          <option value="O">O</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      ) : (
                        <span className="grade-badge">{subject.grade}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#22c55e' }}>
                      {GRADE_POINTS[subject.grade]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button onClick={handleSave} className="save-btn">
              💾 Save Data
            </button>
            <button onClick={handleReset} className="cancel-btn">
              🔄 Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMarksheetUpload;
