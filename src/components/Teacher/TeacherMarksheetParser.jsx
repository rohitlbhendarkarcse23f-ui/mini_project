import { useState, useRef, useCallback } from 'react';
import { parseMarksheet, calculateSGPA, GRADE_POINTS, VALID_GRADES } from '../../utils/aiMarksheetExtractor';
import { saveMarksheets, saveStudentProfile } from '../../api/profiles';
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
  const [queue, setQueue]       = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast]       = useState('');
  const nextId = useRef(0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // ── Enqueue files ──────────────────────────────────────────────
  const enqueue = useCallback((files) => {
    const items = Array.from(files)
      .filter(f => f.type.startsWith('image/') || f.type === 'application/pdf')
      .map(file => ({ id: ++nextId.current, file, status: 'pending', progress: '', data: null, errors: [], confidence: 0, method: '' }));
    if (items.length) setQueue(prev => [...prev, ...items]);
  }, []);

  // ── Parse one item ─────────────────────────────────────────────
  const parseItem = useCallback(async (id) => {
    // Grab the file from current queue state
    let file;
    setQueue(prev => {
      const item = prev.find(q => q.id === id);
      if (item) file = item.file;
      return prev.map(q => q.id === id ? { ...q, status: 'parsing', progress: 'Starting…' } : q);
    });

    if (!file) return;

    const onProgress = ({ message }) =>
      setQueue(prev => prev.map(q => q.id === id ? { ...q, progress: message } : q));

    let result;
    try {
      result = await parseMarksheet(file, onProgress);
    } catch (err) {
      result = { success: false, data: null, confidence: 0, method: 'none', errors: [err.message] };
    }

    setQueue(prev => prev.map(q => q.id === id ? {
      ...q,
      status:     result.success ? 'review' : 'error',
      progress:   '',
      data:       result.data,
      errors:     result.errors || [],
      confidence: result.confidence || 0,
      method:     result.method || '',
    } : q));

    if (result.success) setExpanded(id);
  }, []);

  const parseAll = () => setQueue(prev => { prev.filter(q => q.status === 'pending').forEach(q => parseItem(q.id)); return prev; });

  // ── Inline edit ────────────────────────────────────────────────
  const updateField = (id, field, value) =>
    setQueue(prev => prev.map(q => q.id === id ? { ...q, data: { ...q.data, [field]: value } } : q));

  const updateSubject = (id, idx, field, value) =>
    setQueue(prev => prev.map(q => {
      if (q.id !== id) return q;
      const subjects = q.data.subjects.map((s, i) =>
        i === idx ? { ...s, [field]: value, gradePoints: field === 'grade' ? (GRADE_POINTS[value] ?? s.gradePoints) : s.gradePoints } : s
      );
      return { ...q, data: { ...q.data, subjects, sgpa: calculateSGPA(subjects) } };
    }));

  const addSubject = (id) =>
    setQueue(prev => prev.map(q => q.id !== id ? q : {
      ...q, data: { ...q.data, subjects: [...q.data.subjects, { code: '', name: '', credits: 3, grade: 'B', gradePoints: 6, result: 'PASS' }] }
    }));

  const removeSubject = (id, idx) =>
    setQueue(prev => prev.map(q => {
      if (q.id !== id || q.data.subjects.length <= 1) return q;
      const subjects = q.data.subjects.filter((_, i) => i !== idx);
      return { ...q, data: { ...q.data, subjects, sgpa: calculateSGPA(subjects) } };
    }));

  // ── Save ───────────────────────────────────────────────────────
  const saveItem = async (id) => {
    const item = queue.find(q => q.id === id);
    if (!item?.data) return;
    if (!item.data.studentId || item.data.studentId === 'UNKNOWN') {
      showToast('⚠️ Set a valid Student ID before saving'); return;
    }
    commitToLocalStorage(item.data);
    await commitToAPI(item.data).catch(() => {});
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'saved' } : q));
    setExpanded(null);
    showToast(`✅ Saved ${item.data.studentId} — Sem ${item.data.semester} (SGPA ${item.data.sgpa})`);
  };

  const saveAll   = () => queue.filter(q => q.status === 'review').forEach(q => saveItem(q.id));
  const removeItem = (id) => setQueue(prev => prev.filter(q => q.id !== id));
  const clearSaved = () => setQueue(prev => prev.filter(q => q.status !== 'saved'));

  const counts = queue.reduce((acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; }, {});

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 12, padding: '13px 20px', color: 'white', fontSize: 14, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {/* Parser info banner */}
      <div style={{ padding: '10px 16px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: 11, fontWeight: 600 }}>Docling</span>
        <span>PDF · JPG · PNG — all parsed via Docling on the backend</span>
      </div>

      {/* Drop zone */}
      <div
        onDrop={e => { e.preventDefault(); enqueue(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}
        onClick={() => document.getElementById('tms-file-input').click()}
        style={{ border: '2px dashed rgba(99,102,241,0.4)', borderRadius: 16, padding: '36px 24px', textAlign: 'center', background: 'rgba(99,102,241,0.03)', marginBottom: 20, cursor: 'pointer' }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" style={{ marginBottom: 10 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 4 }}>Drop marksheet files here or click to browse</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>PDF · JPG · PNG — all parsed via Docling, multiple files supported</p>
        <input id="tms-file-input" type="file" multiple accept="image/*,.pdf" onChange={e => enqueue(e.target.files)} style={{ display: 'none' }} />
      </div>

      {/* Toolbar */}
      {queue.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            {Object.entries(counts).map(([status, n]) => (
              <span key={status} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: STATUS_META[status]?.color + '22', color: STATUS_META[status]?.color, border: `1px solid ${STATUS_META[status]?.color}44` }}>
                {STATUS_META[status]?.label}: {n}
              </span>
            ))}
          </div>
          {counts.pending > 0 && (
            <button onClick={parseAll} style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Parse All ({counts.pending})
            </button>
          )}
          {counts.review > 0 && (
            <button onClick={saveAll} style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', borderRadius: 9, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Save All ({counts.review})
            </button>
          )}
          {counts.saved > 0 && (
            <>
              <button onClick={() => queue.filter(q => q.status === 'saved').forEach(q => parseItem(q.id))}
                style={{ padding: '8px 18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 9, color: '#fbbf24', fontSize: 13, cursor: 'pointer' }}>
                ↺ Re-parse All Saved ({counts.saved})
              </button>
              <button onClick={clearSaved} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>
                Clear Saved
              </button>
            </>
          )}
        </div>
      )}

      {/* Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {queue.map(item => (
          <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${STATUS_META[item.status]?.color}33`, borderRadius: 14, overflow: 'hidden' }}>

            {/* Row header */}
            <div
              onClick={() => item.data && setExpanded(prev => prev === item.id ? null : item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: item.data ? 'pointer' : 'default', flexWrap: 'wrap' }}
            >
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: STATUS_META[item.status]?.color + '22', color: STATUS_META[item.status]?.color, border: `1px solid ${STATUS_META[item.status]?.color}44`, whiteSpace: 'nowrap' }}>
                {STATUS_META[item.status]?.label}
              </span>

              <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                {item.file.name}
              </span>

              {item.status === 'parsing' && (
                <span style={{ fontSize: 12, color: '#f59e0b', whiteSpace: 'nowrap' }}>{item.progress}</span>
              )}

              {item.data && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                  {item.data.studentId} · Sem {item.data.semester} · SGPA {item.data.sgpa}
                </span>
              )}

              {item.method && METHOD_BADGE[item.method] && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: METHOD_BADGE[item.method].color + '22', color: METHOD_BADGE[item.method].color, border: `1px solid ${METHOD_BADGE[item.method].color}44`, whiteSpace: 'nowrap' }}>
                  {METHOD_BADGE[item.method].label}
                </span>
              )}

              {item.confidence > 0 && (
                <span style={{ fontSize: 11, color: item.confidence >= 70 ? '#22c55e' : item.confidence >= 40 ? '#f59e0b' : '#ef4444', whiteSpace: 'nowrap' }}>
                  {item.confidence}%
                </span>
              )}

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {item.status === 'pending' && (
                  <button onClick={e => { e.stopPropagation(); parseItem(item.id); }}
                    style={{ padding: '5px 13px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 7, color: '#a5b4fc', fontSize: 12, cursor: 'pointer' }}>
                    Parse
                  </button>
                )}
                {item.status === 'review' && (
                  <button onClick={e => { e.stopPropagation(); saveItem(item.id); }}
                    style={{ padding: '5px 13px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 7, color: '#4ade80', fontSize: 12, cursor: 'pointer' }}>
                    Save
                  </button>
                )}
                {item.status === 'error' && (
                  <button onClick={e => { e.stopPropagation(); parseItem(item.id); }}
                    style={{ padding: '5px 13px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#f87171', fontSize: 12, cursor: 'pointer' }}>
                    Retry
                  </button>
                )}
                {item.status === 'saved' && (
                  <button onClick={e => { e.stopPropagation(); parseItem(item.id); }}
                    style={{ padding: '5px 13px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 7, color: '#fbbf24', fontSize: 12, cursor: 'pointer' }}>
                    ↺ Re-parse
                  </button>
                )}
                <button onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                  style={{ padding: '5px 9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Errors */}
            {item.errors?.length > 0 && item.status !== 'review' && (
              <div style={{ padding: '0 16px 12px', fontSize: 12, color: '#f87171' }}>
                {item.errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
              </div>
            )}

            {/* Expanded review panel */}
            {expanded === item.id && item.data && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '18px 16px' }}>

                {/* Meta fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12, marginBottom: 18 }}>
                  {[
                    { label: 'Student ID',   field: 'studentId' },
                    { label: 'Student Name', field: 'studentName' },
                    { label: 'Branch / Dept',field: 'branch' },
                    { label: 'Exam Year',    field: 'examYear' },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                      <input style={inp} value={item.data[field] || ''} onChange={e => updateField(item.id, field, e.target.value)} placeholder={label} />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Semester</div>
                    <select style={inp} value={item.data.semester} onChange={e => updateField(item.id, 'semester', parseInt(e.target.value))}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} style={{ background: '#1a1d2e' }}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>SGPA</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: item.data.sgpa >= 8 ? '#22c55e' : item.data.sgpa >= 6 ? '#3b82f6' : '#f59e0b' }}>
                      {item.data.sgpa.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>Subjects ({item.data.subjects.length})</span>
                    <button onClick={() => addSubject(item.id)}
                      style={{ padding: '4px 11px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', fontSize: 12, cursor: 'pointer' }}>
                      + Add
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'rgba(99,102,241,0.07)' }}>
                          {['Code', 'Subject Name', 'Cr', 'Grade', 'GP', ''].map(h => (
                            <th key={h} style={{ padding: '7px 9px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.data.subjects.map((sub, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '5px 9px', width: 85 }}>
                              <input style={inp} value={sub.code || ''} onChange={e => updateSubject(item.id, idx, 'code', e.target.value)} placeholder="CS301" />
                            </td>
                            <td style={{ padding: '5px 9px' }}>
                              <input style={inp} value={sub.name} onChange={e => updateSubject(item.id, idx, 'name', e.target.value)} placeholder="Subject name" />
                            </td>
                            <td style={{ padding: '5px 9px', width: 60 }}>
                              <input style={{ ...inp, width: 48 }} type="number" min="1" max="6" value={sub.credits} onChange={e => updateSubject(item.id, idx, 'credits', parseInt(e.target.value) || 3)} />
                            </td>
                            <td style={{ padding: '5px 9px', width: 76 }}>
                              <select style={inp} value={sub.grade} onChange={e => updateSubject(item.id, idx, 'grade', e.target.value)}>
                                {VALID_GRADES.map(g => <option key={g} value={g} style={{ background: '#1a1d2e' }}>{g}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '5px 9px', width: 36, fontWeight: 700, color: GRADE_COLOR[sub.grade] || 'white', textAlign: 'center' }}>
                              {GRADE_POINTS[sub.grade] ?? '?'}
                            </td>
                            <td style={{ padding: '5px 9px', width: 32, textAlign: 'center' }}>
                              {item.data.subjects.length > 1 && (
                                <button onClick={() => removeSubject(item.id, idx)}
                                  style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.55)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {(item.status === 'review' || item.status === 'saved') && (
                  <button onClick={() => saveItem(item.id)}
                    style={{ padding: '10px 26px', background: item.status === 'saved' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    {item.status === 'saved' ? '🔄 Re-save to Student Profile' : '💾 Save to Student Profile'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {queue.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
          No marksheets queued. Drop files above to begin.
        </div>
      )}
    </div>
  );
}
