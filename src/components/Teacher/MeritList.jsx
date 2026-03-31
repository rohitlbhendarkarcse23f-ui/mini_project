import { useState, useEffect, useMemo } from 'react';
import { getAllStudents } from '../../api/profiles';
import {
  sortStudentsByMerit,
  TIE_BREAK_STRATEGIES,
  STRATEGY_LABELS,
  YEAR_SEM_RANGES,
} from '../../utils/meritSort';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Other',
];

const CGPA_COLOR = (v) =>
  v >= 8.5 ? '#22c55e' : v >= 7 ? '#3b82f6' : v >= 5.5 ? '#f59e0b' : '#ef4444';

export default function MeritList() {
  const [allStudents, setAllStudents]   = useState([]);
  const [ranked, setRanked]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [ranking, setRanking]           = useState(false);

  // Filters
  const [dept, setDept]                 = useState('All Departments');
  const [semester, setSemester]         = useState('');
  const [year, setYear]                 = useState('');
  const [minCgpa, setMinCgpa]           = useState('');
  const [maxCgpa, setMaxCgpa]           = useState('');
  const [search, setSearch]             = useState('');
  const [strategy, setStrategy]         = useState(TIE_BREAK_STRATEGIES.TREND);
  const [showOnlyComplete, setShowOnlyComplete] = useState(false);

  // Load students from API + localStorage merge
  useEffect(() => {
    setLoading(true);
    getAllStudents()
      .then(apiStudents => {
        const local = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
        const merged = apiStudents.map(s => {
          const loc = local[s.student_id] || {};
          return {
            ...s,
            id:           s.student_id,
            name:         s.name || loc.name || s.student_id,
            department:   s.department || loc.department || '',
            cgpa:         s.cgpa || loc.cgpa || 0,
            sgpaList:     s.sgpaList?.length ? s.sgpaList : (loc.sgpaList || []),
            semesterData: Object.keys(s.semesterData || {}).length ? s.semesterData : (loc.semesterData || {}),
          };
        });
        // Also include localStorage-only students not yet in API
        Object.entries(local).forEach(([sid, loc]) => {
          if (!merged.find(s => s.student_id === sid)) {
            merged.push({ id: sid, student_id: sid, name: loc.name || sid, department: loc.department || '', cgpa: loc.cgpa || 0, sgpaList: loc.sgpaList || [], semesterData: loc.semesterData || {} });
          }
        });
        setAllStudents(merged.filter(s => (s.sgpaList || []).some(v => v > 0)));
      })
      .catch(() => {
        // Fallback to localStorage only
        const local = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
        const students = Object.entries(local).map(([sid, loc]) => ({
          id: sid, student_id: sid, name: loc.name || sid,
          department: loc.department || '', cgpa: loc.cgpa || 0,
          sgpaList: loc.sgpaList || [], semesterData: loc.semesterData || {},
        })).filter(s => s.sgpaList.some(v => v > 0));
        setAllStudents(students);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtered students before ranking
  const filtered = useMemo(() => {
    return allStudents.filter(s => {
      if (dept !== 'All Departments' && s.department !== dept) return false;
      if (minCgpa && s.cgpa < parseFloat(minCgpa)) return false;
      if (maxCgpa && s.cgpa > parseFloat(maxCgpa)) return false;
      if (showOnlyComplete && (!s.sgpaList || s.sgpaList.filter(v => v > 0).length < 1)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name?.toLowerCase().includes(q) && !s.student_id?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allStudents, dept, minCgpa, maxCgpa, search, showOnlyComplete]);

  // Re-rank whenever filters or strategy change
  useEffect(() => {
    if (filtered.length === 0) { setRanked([]); return; }
    setRanking(true);
    const sem = semester ? parseInt(semester) : null;
    const yr  = year     ? parseInt(year)     : null;
    sortStudentsByMerit(filtered, strategy, sem, yr)
      .then(setRanked)
      .finally(() => setRanking(false));
  }, [filtered, strategy, semester, year]);

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Rank', 'Student ID', 'Name', 'Department', 'CGPA', 'Current SGPA', 'Trend', 'Total Credits', 'Fail Count'],
      ...ranked.map(s => [
        s.rank, s.student_id, s.name, s.department || 'N/A',
        s.cgpa.toFixed(2), s.currentSGPA.toFixed(2),
        s.trend.toFixed(2), s.totalCredits, s.failCount,
      ]),
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'merit_list.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Campus Connect — Merit List', 14, 13);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}  |  ${ranked.length} students`, 200, 13);

    let y = 28;
    const cols = [14, 30, 55, 110, 155, 180, 205, 230, 255];
    const headers = ['#', 'ID', 'Name', 'Department', 'CGPA', 'SGPA', 'Trend', 'Credits', 'Fails'];
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y - 5, 277, 8, 'F');
    doc.setTextColor(30, 58, 138); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;

    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    ranked.forEach((s, idx) => {
      if (y > 185) { doc.addPage(); y = 20; }
      if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(10, y - 4, 277, 7, 'F'); }
      const row = [s.rank, s.student_id, s.name?.slice(0, 22), (s.department || 'N/A')?.slice(0, 20), s.cgpa.toFixed(2), s.currentSGPA.toFixed(2), s.trend.toFixed(2), s.totalCredits, s.failCount];
      row.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 7;
    });
    doc.save('merit_list.pdf');
  };

  const statBox = (label, value, color) => (
    <div key={label} style={{ flex: 1, minWidth: 110, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`, borderRadius: 12 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</div>
    </div>
  );

  const avgCgpa = ranked.length ? (ranked.reduce((s, r) => s + r.cgpa, 0) / ranked.length).toFixed(2) : '—';
  const topCgpa = ranked[0]?.cgpa.toFixed(2) ?? '—';

  const selStyle = { padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'white', fontSize: 13, cursor: 'pointer' };
  const inpStyle = { ...selStyle, width: 72 };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {statBox('Total Students', ranked.length, '#6366f1')}
        {statBox('Top CGPA', topCgpa, '#22c55e')}
        {statBox('Avg CGPA', avgCgpa, '#3b82f6')}
        {statBox('Departments', new Set(ranked.map(s => s.department).filter(Boolean)).size, '#f59e0b')}
      </div>

      {/* Filters */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / ID…"
            style={{ ...selStyle, width: 180 }} />

          {/* Department */}
          <select value={dept} onChange={e => setDept(e.target.value)} style={selStyle}>
            {DEPARTMENTS.map(d => <option key={d} value={d} style={{ background: '#1a1d2e' }}>{d}</option>)}
          </select>

          {/* Year */}
          <select value={year} onChange={e => { setYear(e.target.value); setSemester(''); }} style={selStyle}>
            <option value="" style={{ background: '#1a1d2e' }}>All Years</option>
            {[1, 2, 3, 4].map(y => <option key={y} value={y} style={{ background: '#1a1d2e' }}>Year {y}</option>)}
          </select>

          {/* Semester */}
          <select value={semester} onChange={e => setSemester(e.target.value)} style={selStyle}>
            <option value="" style={{ background: '#1a1d2e' }}>All Semesters</option>
            {(year
              ? Array.from({ length: 2 }, (_, i) => YEAR_SEM_RANGES[parseInt(year)][0] + i)
              : [1, 2, 3, 4, 5, 6, 7, 8]
            ).map(s => <option key={s} value={s} style={{ background: '#1a1d2e' }}>Sem {s}</option>)}
          </select>

          {/* CGPA range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>CGPA</span>
            <input value={minCgpa} onChange={e => setMinCgpa(e.target.value)} placeholder="Min" type="number" min="0" max="10" step="0.1" style={inpStyle} />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>–</span>
            <input value={maxCgpa} onChange={e => setMaxCgpa(e.target.value)} placeholder="Max" type="number" min="0" max="10" step="0.1" style={inpStyle} />
          </div>

          {/* Tie-breaker strategy */}
          <select value={strategy} onChange={e => setStrategy(e.target.value)} style={selStyle}>
            {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
              <option key={k} value={k} style={{ background: '#1a1d2e' }}>{v}</option>
            ))}
          </select>

          {/* Only with data */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            <input type="checkbox" checked={showOnlyComplete} onChange={e => setShowOnlyComplete(e.target.checked)} />
            Has SGPA data
          </label>

          {/* Reset */}
          <button onClick={() => { setDept('All Departments'); setSemester(''); setYear(''); setMinCgpa(''); setMaxCgpa(''); setSearch(''); setShowOnlyComplete(false); setStrategy(TIE_BREAK_STRATEGIES.TREND); }}
            style={{ ...selStyle, color: 'rgba(255,255,255,0.5)' }}>
            Reset
          </button>

          {/* Export */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={exportCSV} style={{ padding: '8px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 9, color: '#4ade80', fontSize: 13, cursor: 'pointer' }}>
              ↓ CSV
            </button>
            <button onClick={exportPDF} style={{ padding: '8px 14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 9, color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}>
              ↓ PDF
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {(loading || ranking) ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          {loading ? 'Loading students…' : 'Calculating rankings…'}
        </div>
      ) : ranked.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
          No students match the current filters.
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {ranked.length >= 3 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
              {[ranked[1], ranked[0], ranked[2]].map((s, i) => {
                const medals = ['🥈', '🥇', '🥉'];
                const sizes  = [80, 96, 80];
                return (
                  <div key={s.student_id} style={{ flex: 1, maxWidth: 200, textAlign: 'center', padding: '20px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16 }}>
                    <div style={{ fontSize: sizes[i] / 3, marginBottom: 6 }}>{medals[i]}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{s.student_id}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: CGPA_COLOR(s.cgpa) }}>{s.cgpa.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>CGPA</div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Rank', 'Student', 'Department', 'CGPA', semester ? `Sem ${semester} SGPA` : 'Latest SGPA', 'Trend', 'Credits', 'Fails'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.45)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranked.map(s => (
                  <tr key={s.student_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontWeight: 700, color: s.rank <= 3 ? ['#fbbf24', '#9ca3af', '#cd7f32'][s.rank - 1] : 'rgba(255,255,255,0.5)', fontSize: s.rank <= 3 ? 15 : 13 }}>
                        {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : `#${s.rank}`}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.student_id}</div>
                    </td>
                    <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{s.department || 'N/A'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontWeight: 700, color: CGPA_COLOR(s.cgpa), fontSize: 15 }}>{s.cgpa.toFixed(2)}</span>
                    </td>
                    <td style={{ padding: '11px 14px', color: CGPA_COLOR(s.currentSGPA), fontWeight: 600 }}>{s.currentSGPA.toFixed(2)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ color: s.trend > 0 ? '#22c55e' : s.trend < 0 ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        {s.trend > 0 ? '↑' : s.trend < 0 ? '↓' : '→'} {Math.abs(s.trend).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.5)' }}>{s.totalCredits}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ color: s.failCount > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{s.failCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Algorithm info */}
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Ranking: CGPA → {semester ? `Sem ${semester} SGPA` : 'Latest SGPA'} → {STRATEGY_LABELS[strategy]} → SHA-256 tie-breaker
          </div>
        </>
      )}
    </div>
  );
}
