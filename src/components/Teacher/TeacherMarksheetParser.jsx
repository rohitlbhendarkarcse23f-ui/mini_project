import { useState, useRef, useCallback, useEffect } from 'react';
import { parseMarksheet, calculateSGPA, GRADE_POINTS, VALID_GRADES } from '../../utils/aiMarksheetExtractor';
import { saveMarksheets, saveStudentProfile, getAllStudents } from '../../api/profiles';

// ── Persist to localStorage + fire storage event ─────────────────
function commitToLocalStorage(data) {
  const sid = data.studentId?.toUpperCase();
  if (!sid || sid === 'UNKNOWN') return;

  const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
  const current  = profiles[sid] || {};
  const sgpaList = [...(current.sgpaList || [])];
  sgpaList[data.semester - 1] = data.sgpa;

  const semesterData = {
    ...(current.semesterData || {}),
    [data.semester]: (data.subjects || []).map(s => ({
      name: s.name, code: s.code, credits: s.credits,
      grade: s.grade, gradePoints: s.gradePoints,
    })),
  };

  const valid = sgpaList.filter(v => v != null && v > 0);
  const cgpa  = valid.length > 0
    ? parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
    : data.sgpa;

  profiles[sid] = {
    ...current, student_id: sid,
    name:       data.studentName || current.name || sid,
    department: data.branch      || current.department || '',
    cgpa, sgpaList, semesterData,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem('studentProfiles', JSON.stringify(profiles));

  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const idx = students.findIndex(s => s.student_id === sid);
  const entry = { student_id: sid, name: profiles[sid].name, department: profiles[sid].department, cgpa, sgpaList, semesterData };
  if (idx >= 0) students[idx] = { ...students[idx], ...entry };
  else students.push(entry);
  localStorage.setItem('students', JSON.stringify(students));
  window.dispatchEvent(new Event('storage'));
}

async function commitToAPI(data) {
  const sid = data.studentId?.toUpperCase();
  if (!sid || sid === 'UNKNOWN') return;
  const profiles     = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
  const profile      = profiles[sid] || {};
  const marksheetArr = Object.entries(profile.semesterData || {}).map(([sem, subs]) => ({
    semester: parseInt(sem), sgpa: profile.sgpaList?.[parseInt(sem) - 1] || 0, subjects: subs,
  }));
  await Promise.allSettled([
    saveMarksheets(sid, marksheetArr),
    saveStudentProfile(sid, { name: profile.name, department: profile.department, cgpa: profile.cgpa, sgpaList: profile.sgpaList, semesterData: profile.semesterData }),
  ]);
}

// ── Constants ─────────────────────────────────────────────────────
const STATUS_META = {
  pending:  { label: 'Pending',  color: '#6366f1' },
  parsing:  { label: 'Parsing…', color: '#f59e0b' },
  review:   { label: 'Review',   color: '#3b82f6' },
  saved:    { label: 'Saved ✓',  color: '#22c55e' },
  error:    { label: 'Error',    color: '#ef4444' },
};

const GRADE_COLOR = {
  'O':'#22c55e','A+':'#3b82f6','A':'#06b6d4','B+':'#f59e0b',
  'B':'#f97316','C':'#ef4444','D':'#dc2626','F':'#7f1d1d',
};

const METHOD_BADGE = {
  docling: { label: 'Docling', color: '#8b5cf6' },
  ocr:     { label: 'OCR',     color: '#f59e0b' },
};

const inp = {
  padding: '6px 10px', background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px',
  color: 'white', fontSize: '13px', width: '100%',
};

// ── Component ─────────────────────────────────────────────────────
export default function TeacherMarksheetParser() {
  const [allStudents, setAllStudents] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Fetch student data
  useEffect(() => {
      setDbLoading(true);
      getAllStudents()
        .then(apiStudents => {
          // Merge API data with LocalStorage correctly
          const local = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
          const merged = apiStudents.map(s => {
            const loc = local[s.student_id] || {};
            return {
              ...s,
              id: s.student_id,
              name: s.name || loc.name || s.student_id,
              department: s.department || loc.department || '',
              cgpa: s.cgpa || loc.cgpa || 0,
              sgpaList: s.sgpaList?.length ? s.sgpaList : (loc.sgpaList || []),
              semesterData: Object.keys(s.semesterData || {}).length ? s.semesterData : (loc.semesterData || {}),
            };
          });
          Object.entries(local).forEach(([sid, loc]) => {
            if (!merged.find(s => s.student_id === sid)) {
              merged.push({ id: sid, student_id: sid, name: loc.name || sid, department: loc.department || '', cgpa: loc.cgpa || 0, sgpaList: loc.sgpaList || [], semesterData: loc.semesterData || {} });
            }
          });
          setAllStudents(merged.filter(s => Object.keys(s.semesterData || {}).length > 0));
        })
        .catch(err => showToast('Failed to load database. ' + err.message))
        .finally(() => setDbLoading(false));
  }, []);

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 12, padding: '13px 20px', color: 'white', fontSize: 14, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>Uploaded Marksheets Database</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Review verified academic histories provided by students</p>
          </div>
          <div style={{ overflowX: 'auto', padding: 20 }}>
            {dbLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading students...</div>
            ) : allStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No students have uploaded their marksheets yet.</div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {allStudents.map(student => (
                      <div key={student.student_id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div 
                          onClick={() => setExpandedStudent(prev => prev === student.student_id ? null : student.student_id)}
                          style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                           <div>
                              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{student.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'normal', fontSize: '13px' }}>({student.student_id})</span></div>
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px' }}>{student.department}</div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ color: '#10b981', fontWeight: 'bold' }}>{student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'} CGPA</div>
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{Object.keys(student.semesterData || {}).length} Semesters Uploaded</div>
                           </div>
                        </div>

                        {expandedStudent === student.student_id && (
                           <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                 {Object.entries(student.semesterData || {}).map(([sem, subjects]) => {
                                    const semSgpa = student.sgpaList?.[parseInt(sem)-1] || 0;
                                    return (
                                     <div key={sem} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                                           <strong style={{color:'#60a5fa'}}>Semester {sem}</strong>
                                           <strong style={{color:semSgpa>=8?'#4ade80':'#fbbf24'}}>SGPA {Number(semSgpa).toFixed(2)}</strong>
                                        </div>
                                        <table style={{width:'100%',fontSize:'12px',borderCollapse:'collapse'}}>
                                           <thead>
                                              <tr style={{textAlign:'left',color:'rgba(255,255,255,0.4)',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                                                 <th style={{padding:'4px'}}>Subject</th>
                                                 <th style={{padding:'4px'}}>Cr</th>
                                                 <th style={{padding:'4px'}}>Grade</th>
                                              </tr>
                                           </thead>
                                           <tbody>
                                              {(subjects || []).map((sub, i) => (
                                                 <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                                                    <td style={{padding:'6px 4px',color:'rgba(255,255,255,0.8)'}}>{sub.name}</td>
                                                    <td style={{padding:'6px 4px',color:'rgba(255,255,255,0.6)'}}>{sub.credits}</td>
                                                    <td style={{padding:'6px 4px',color:GRADE_COLOR[sub.grade]||'white',fontWeight:'bold'}}>{sub.grade}</td>
                                                 </tr>
                                              ))}
                                           </tbody>
                                        </table>
                                     </div>
                                 )})}
                              </div>
                           </div>
                        )}
                      </div>
                  ))}
               </div>
            )}
          </div>
        </div>
    </div>
  );
}
