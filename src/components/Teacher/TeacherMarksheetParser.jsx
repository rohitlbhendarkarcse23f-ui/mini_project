import { useState, useCallback, useEffect } from 'react';
import { getStudentMarksheets } from '../../api/profiles';

export default function TeacherMarksheetParser() {
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudentMarksheets();
      setStudents(Array.isArray(data) ? data : []);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMarksheets = students.reduce((n, s) => n + s.marksheets.length, 0);
  const withFiles       = students.reduce((n, s) => n + s.marksheets.filter(m => m.hasFile).length, 0);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Students',    value: students.length,   color: '#6366f1' },
          { label: 'Marksheets',  value: totalMarksheets,   color: '#3b82f6' },
          { label: 'Files Uploaded', value: withFiles,      color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 110, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`, borderRadius: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student…"
            style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'white', fontSize: 13, width: 200 }}
          />
          <button onClick={load} style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer' }}>↻</button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
          {search ? 'No students match your search.' : 'No students have uploaded marksheets yet.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(student => {
          const isOpen = expanded === student.student_id;
          return (
            <div key={student.student_id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>

              {/* Header row */}
              <div
                onClick={() => setExpanded(isOpen ? null : student.student_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer' }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#a5b4fc', fontSize: 16, flexShrink: 0 }}>
                  {(student.name || student.student_id)[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.name || student.student_id}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                    {student.student_id} · {student.department || 'N/A'}
                  </div>
                </div>

                {/* Semester chips preview */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {student.marksheets.map(ms => (
                    <span key={ms.semester} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: ms.hasFile ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', color: ms.hasFile ? '#4ade80' : 'rgba(255,255,255,0.35)', border: `1px solid ${ms.hasFile ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                      Sem {ms.semester}{ms.sgpa > 0 ? ` · ${ms.sgpa.toFixed(2)}` : ''}
                    </span>
                  ))}
                </div>

                {student.cgpa > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: student.cgpa >= 8 ? '#22c55e' : student.cgpa >= 6 ? '#3b82f6' : '#f59e0b', flexShrink: 0 }}>
                    {student.cgpa.toFixed(2)}
                  </span>
                )}

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Expanded: per-semester detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {student.marksheets.map(ms => (
                      <div key={ms.semester} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.85)', minWidth: 80 }}>Semester {ms.semester}</span>

                          {ms.sgpa > 0 && (
                            <span style={{ fontSize: 12, color: ms.sgpa >= 8 ? '#22c55e' : ms.sgpa >= 6 ? '#3b82f6' : '#f59e0b', fontWeight: 700 }}>
                              SGPA {ms.sgpa.toFixed(2)}
                            </span>
                          )}

                          {ms.subjectCount > 0 && (
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{ms.subjectCount} subjects</span>
                          )}

                          <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 20, background: ms.hasFile ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', color: ms.hasFile ? '#4ade80' : 'rgba(255,255,255,0.3)', border: `1px solid ${ms.hasFile ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                            {ms.hasFile ? '📄 File uploaded' : 'No file'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CGPA summary */}
                  {student.cgpa > 0 && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 9, border: '1px solid rgba(99,102,241,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Overall CGPA</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: student.cgpa >= 8 ? '#22c55e' : student.cgpa >= 6 ? '#3b82f6' : '#f59e0b' }}>{student.cgpa.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
