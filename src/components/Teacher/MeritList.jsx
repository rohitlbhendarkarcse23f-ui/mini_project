import { useState, useEffect, useMemo } from 'react';
import {
  sortStudentsByMerit,
  TIE_BREAK_STRATEGIES,
  STRATEGY_LABELS,
  YEAR_SEM_RANGES,
} from '../../utils/meritSort';
import { parseMarksheet } from '../../utils/aiMarksheetExtractor';
import { saveMarksheets, saveStudentProfile, getStudentMarksheets, fetchMarksheetFile, getAllStudents } from '../../api/profiles';
import './MeritList.css';

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

// A simple sparkline component for visualizing SGPAs
function Sparkline({ data }) {
  if (!data || data.length === 0) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>No data</span>;
  const max = 10;
  const min = 0;
  const width = 60;
  const height = 20;

  const points = data.map((val, idx) => {
    const x = (idx / Math.max(1, (data.length - 1))) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((val, idx) => {
        const x = (idx / Math.max(1, (data.length - 1))) * width;
        const y = height - ((val - min) / (max - min)) * height;
        return <circle key={idx} cx={x} cy={y} r="2" fill="#fff" />;
      })}
    </svg>
  );
}

export default function MeritList() {
  const [allStudents, setAllStudents]   = useState([]);
  const [ranked, setRanked]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [ranking, setRanking]           = useState(false);
  
  // Batch Parsing
  const [batchProgress, setBatchProgress] = useState(null); // { total, current, errors }

  // Filters
  const [dept, setDept]                 = useState('All Departments');
  const [semester, setSemester]         = useState('');
  const [year, setYear]                 = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [minCgpa, setMinCgpa]           = useState('');
  const [maxCgpa, setMaxCgpa]           = useState('');
  const [search, setSearch]             = useState('');
  const [strategy, setStrategy]         = useState(TIE_BREAK_STRATEGIES.HOLISTIC);
  const [showOnlyComplete, setShowOnlyComplete] = useState(false);
  const [advancedFilters, setAdvancedFilters]   = useState(false);

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
        setAllStudents(merged); // Provide ALL students, unparsed or not.
      })
      .catch(() => {
        // Fallback to localStorage only
        const local = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
        const students = Object.entries(local).map(([sid, loc]) => ({
          id: sid, student_id: sid, name: loc.name || sid,
          department: loc.department || '', cgpa: loc.cgpa || 0,
          sgpaList: loc.sgpaList || [], semesterData: loc.semesterData || {},
        }));
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

  // Derive subjects dynamically for subject filter options
  const availableSubjects = useMemo(() => {
    if (!semester && !year) return [];
    const subjectsSet = new Set();
    filtered.forEach(s => {
      if (semester) {
        const semData = s.semesterData?.[semester] || [];
        semData.forEach(sub => sub?.name && subjectsSet.add(sub.name));
      } else if (year) {
         const [start, end] = YEAR_SEM_RANGES[year];
         for(let i=start; i<=end; i++) {
            const semData = s.semesterData?.[i] || [];
            semData.forEach(sub => sub?.name && subjectsSet.add(sub.name));
         }
      }
    });
    return Array.from(subjectsSet).sort();
  }, [filtered, semester, year]);

  // Re-rank whenever filters or strategy change
  useEffect(() => {
    if (filtered.length === 0) { setRanked([]); return; }
    setRanking(true);
    const sem = semester ? parseInt(semester) : null;
    const yr  = year     ? parseInt(year)     : null;
    const sub = subjectFilter || null;
    
    sortStudentsByMerit(filtered, strategy, sem, yr, sub)
      .then(setRanked)
      .finally(() => setRanking(false));
  }, [filtered, strategy, semester, year, subjectFilter]);

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Rank', 'Student ID', 'Name', 'Department', 'CGPA', 'Current SGPA', 'Trend', 'Total Credits', 'Fail Count'],
      ...ranked.map(s => [
        s.rank, s.student_id, s.name, s.department || 'N/A',
        s.cgpa.toFixed(2), s.currentSGPA.toFixed(2),
        s.trend.toFixed(3), s.totalCredits, s.failCount,
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
    // ... logic remains
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Campus Connect — Merit List', 14, 13);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}  |  ${SubjectFilterActive ? subjectFilter + ' | ' : ''}${ranked.length} students`, 200, 13);

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
      const row = [s.rank, s.student_id, s.name?.slice(0, 22), (s.department || 'N/A')?.slice(0, 20), Number(s.cgpa).toFixed(2), Number(s.currentSGPA).toFixed(2), Number(s.trend).toFixed(3), s.totalCredits, s.failCount];
      row.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 7;
    });
    doc.save('merit_list.pdf');
  };

  const forceGenerate = () => {
    setRanking(true);
    setTimeout(() => {
        const sem = semester ? parseInt(semester) : null;
        const yr  = year     ? parseInt(year)     : null;
        const sub = subjectFilter || null;
        sortStudentsByMerit(filtered, strategy, sem, yr, sub).then(setRanked).finally(() => setRanking(false));
    }, 600); // add a slight delay for visual UX "generation" phase
  };

  const runBatchDocling = async () => {
    // 1. Fetch exact server state dynamically bypassing local state quirks
    let apiStudents = [];
    try {
       apiStudents = await getStudentMarksheets();
    } catch (e) {
       alert("Failed to reach server: " + e.message); return;
    }

    // 2. Identify raw marksheets (has file_url but sgpa === 0)
    let jobs = apiStudents.flatMap(s => 
        (s.marksheets || []).filter(m => m.file_url && (!m.sgpa || m.sgpa === 0)).map(m => ({ student: s, sem: m.semester, url: m.file_url }))
    );

    if (jobs.length === 0) {
       alert("No unparsed marksheets available. All uploaded marksheets are already extracted!");
       return;
    }
    
    setBatchProgress({ total: jobs.length, current: 0, errors: [] });
    
    // 2. Process concurrently for minimum most time
    await Promise.allSettled(jobs.map(async (job) => {
       try {
          const file = await fetchMarksheetFile(job.url);
          
          const result = await parseMarksheet(file, () => {});
          if (!result.success) throw new Error(result.errors.join(', '));
          
          // Save extracted result
          const data = result.data;
          const sid = job.student.student_id;
          const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
          const current = profiles[sid] || {};
          const sgpaList = [...(current.sgpaList || job.student.sgpaList || [])];
          sgpaList[job.sem - 1] = data.sgpa;
          
          const semesterData = {
            ...(current.semesterData || job.student.semesterData || {}),
            [job.sem]: (data.subjects || []).map(s => ({
              name: s.name, code: s.code, credits: s.credits,
              grade: s.grade, gradePoints: s.gradePoints,
            })),
          };
          
          const valid = sgpaList.filter(v => v != null && v > 0);
          const cgpa = valid.length > 0 ? parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)) : data.sgpa;
          
          profiles[sid] = {
             ...current, student_id: sid, cgpa, sgpaList, semesterData, lastUpdated: new Date().toISOString(),
          };
          localStorage.setItem('studentProfiles', JSON.stringify(profiles));
          
          const marksheetArr = Object.entries(semesterData).map(([s, subs]) => ({
             semester: parseInt(s), sgpa: sgpaList?.[parseInt(s) - 1] || 0, subjects: subs,
          }));
          await saveMarksheets(sid, marksheetArr).catch(() => {});
          await saveStudentProfile(sid, { cgpa, sgpaList, semesterData }).catch(() => {});
          
       } catch (error) {
          setBatchProgress(prev => ({ ...prev, errors: [...(prev?.errors || []), `Error on ${job.student.name} Sem ${job.sem}: ${error.message}`] }));
       } finally {
          setBatchProgress(prev => ({ ...prev, current: (prev?.current || 0) + 1 }));
       }
    }));
    
    // Auto-refresh the list seamlessly
    setTimeout(() => {
       setBatchProgress(null);
       alert("Extraction Complete! Merit List will now regenerate automatically.");
       forceGenerate(); // Automatically push the freshly saved data into the algorithms
    }, 1500);
  };
  
  const statBox = (label, value, color) => (
    <div key={label} className="merit-stat-box" style={{ 
      borderColor: `${color}44`,
      backgroundColor: `color-mix(in srgb, ${color} 4%, transparent)`
    }}>
      <div className="merit-stat-value" style={{ color }}>{value}</div>
      <div className="merit-stat-label">{label}</div>
    </div>
  );

  const avgCgpa = ranked.length ? (ranked.reduce((s, r) => s + Number(r.cgpa), 0) / ranked.length).toFixed(2) : '—';
  const topCgpa = ranked[0]?.cgpa ? Number(ranked[0].cgpa).toFixed(2) : '—';
  const SubjectFilterActive = !!subjectFilter;

  return (
    <div className="merit-list-container">
      {/* Header & Stats */}
      <div className="merit-header">
        <h2>Academic Merit List</h2>
        <div className="merit-subtitle">Evaluate performance horizontally across departments and semesters.</div>
      </div>

      <div className="merit-stats-container">
        {statBox('Total Students', ranked.length, '#6366f1')}
        {statBox('Top CGPA', topCgpa, '#22c55e')}
        {statBox('Avg CGPA', avgCgpa, '#3b82f6')}
        {statBox('Departments', new Set(ranked.map(s => s.department).filter(Boolean)).size, '#f59e0b')}
      </div>

      {/* Main Filter Bar */}
      <div className="merit-filters">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search name / ID…"
          className="merit-input" 
          style={{ width: '220px' }} 
        />
        
        <select value={dept} onChange={e => setDept(e.target.value)} className="merit-select">
          {DEPARTMENTS.map(d => <option key={d} value={d} className="merit-option">{d}</option>)}
        </select>
        
        <div className="merit-quick-actions">
           <button onClick={runBatchDocling} className="merit-btn" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.1))', borderColor: '#8b5cf6', color: '#c4b5fd' }}>
              ⟳ Parse Marksheets
           </button>
           <button onClick={forceGenerate} className="merit-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 'bold' }}>
              ▶ Generate Merit List
           </button>
           <button onClick={() => setAdvancedFilters(!advancedFilters)} className={`merit-btn ${advancedFilters ? 'active' : ''}`}>
              {advancedFilters ? 'Hide Advanced Filters' : 'Advanced Filters'}
           </button>
           <button onClick={exportCSV} className="merit-btn export-csv">↓ CSV</button>
           <button onClick={exportPDF} className="merit-btn export-pdf">↓ PDF</button>
        </div>
      </div>
      
      {batchProgress && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#1e1b4b', padding: '40px', borderRadius: '24px', border: '1px solid #8b5cf6', width: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
             <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>🤖 AI Batch Extraction</h2>
             <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: `${(batchProgress.current / Math.max(1, batchProgress.total)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', transition: 'width 0.4s ease' }} />
             </div>
             <p style={{ color: '#a78bfa', margin: '0 0 20px', fontWeight: 'bold' }}>Processing {batchProgress.current} / {batchProgress.total} Marksheets</p>
             {batchProgress.errors.length > 0 && (
                <div style={{ textAlign: 'left', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px', borderRadius: '8px', color: '#f87171', fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                   {batchProgress.errors.map((e, i) => <div key={i} style={{marginBottom: '4px'}}>⚠ {e}</div>)}
                </div>
             )}
             {batchProgress.current >= batchProgress.total && batchProgress.total > 0 && (
                <p style={{ color: '#4ade80', fontWeight: 'bold', marginTop: '20px' }}>✅ Extraction Complete! Refreshing ranks...</p>
             )}
          </div>
        </div>
      )}

      {/* Advanced Filter Collapse */}
      {advancedFilters && (
        <div className="merit-advanced-filters">
           <div className="filter-group">
              <label>Year & Semester</label>
              <div className="filter-row">
                 <select value={year} onChange={e => { setYear(e.target.value); setSemester(''); setSubjectFilter(''); }} className="merit-select">
                   <option value="">All Years</option>
                   {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                 </select>
                 
                 <select value={semester} onChange={e => { setSemester(e.target.value); setSubjectFilter(''); }} className="merit-select">
                   <option value="">All Semesters</option>
                   {(year
                     ? Array.from({ length: 2 }, (_, i) => YEAR_SEM_RANGES[parseInt(year)][0] + i)
                     : [1, 2, 3, 4, 5, 6, 7, 8]
                   ).map(s => <option key={s} value={s}>Semester {s}</option>)}
                 </select>
              </div>
           </div>

           {(semester || year) && availableSubjects.length > 0 && (
             <div className="filter-group">
                <label>Target Subject</label>
                <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="merit-select">
                  <option value="">Compute total SGPA</option>
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
             </div>
           )}

           <div className="filter-group">
              <label>Tie-Breaker Strategy</label>
              <select value={strategy} onChange={e => setStrategy(e.target.value)} className="merit-select w-full">
                {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
           </div>
           
           <div className="filter-group">
              <label>CGPA Range</label>
              <div className="filter-row">
                <input value={minCgpa} onChange={e => setMinCgpa(e.target.value)} placeholder="0.0" type="number" min="0" max="10" step="0.1" className="merit-input" style={{ width: '80px'}} />
                <span className="text-secondary">-</span>
                <input value={maxCgpa} onChange={e => setMaxCgpa(e.target.value)} placeholder="10.0" type="number" min="0" max="10" step="0.1" className="merit-input" style={{ width: '80px'}} />
              </div>
           </div>

           <div className="filter-group flex-center">
              <label className="checkbox-label">
                <input type="checkbox" checked={showOnlyComplete} onChange={e => setShowOnlyComplete(e.target.checked)} />
                Has academic data
              </label>
           </div>
           
           <div className="filter-group flex-center" style={{ marginLeft: 'auto' }}>
              <button 
                onClick={() => { setSemester(''); setYear(''); setMinCgpa(''); setMaxCgpa(''); setSubjectFilter(''); setShowOnlyComplete(false); setStrategy(TIE_BREAK_STRATEGIES.HOLISTIC); }}
                className="merit-btn text-muted"
              >
                Reset
              </button>
           </div>
        </div>
      )}

      {/* Table & Podium */}
      {(loading || ranking) ? (
        <div className="merit-state-msg">
          <div className="spinner"></div>
          {loading ? 'Fetching student records…' : 'Calculating positions…'}
        </div>
      ) : ranked.length === 0 ? (
        <div className="merit-state-msg">
          No students match the current filters.
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {ranked.length >= 3 && !search && (
            <div className="podium-container">
              {[ranked[1], ranked[0], ranked[2]].map((s, i) => {
                const isFirst = i === 1;
                const medals = ['🥈', '🥇', '🥉'];
                const placeClasses = ['second-place', 'first-place', 'third-place'];
                
                return (
                  <div key={s.student_id} className={`podium-card ${placeClasses[i]}`}>
                    <div className="podium-medal">{medals[i]}</div>
                    <div className="podium-name">{s.name}</div>
                    <div className="podium-id">{s.student_id}</div>
                    <div className="podium-score" style={{ color: CGPA_COLOR(s.cgpa) }}>
                      {SubjectFilterActive ? (s.subjectGrade ? `${s.subjectGrade} GP` : 'N/A') : s.cgpa.toFixed(2)}
                    </div>
                    <div className="podium-label">{SubjectFilterActive ? subjectFilter : 'CGPA'}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="merit-table-container">
            <table className="merit-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Info</th>
                  <th>Department</th>
                  <th>{SubjectFilterActive ? 'Target Subject' : 'CGPA'}</th>
                  {!SubjectFilterActive && <th>{semester ? `Sem ${semester} SGPA` : 'Latest SGPA'}</th>}
                  {!SubjectFilterActive && <th>Trend</th>}
                  {SubjectFilterActive && <th>Overall CGPA</th>}
                  <th>Fails</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((s, idx) => {
                  const sgpaSeries = s.semesterBreakdown?.map(b => b.sgpa).filter(v => v > 0) || [];

                  return (
                  <tr key={s.student_id}>
                    <td>
                      <div className={`merit-rank rank-${s.rank}`}>
                        {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : `#${s.rank}`}
                      </div>
                    </td>
                    <td>
                      <div className="merit-name">{s.name}</div>
                      <div className="merit-id">{s.student_id}</div>
                    </td>
                    <td><div className="merit-dept">{s.department || 'N/A'}</div></td>
                    <td>
                      {SubjectFilterActive ? (
                         <div className="merit-score prominent" style={{ color: s.subjectGrade ? '#4ade80' : 'rgba(255,255,255,0.2)'}}>
                            {s.subjectGrade || 'No Data'}
                         </div>
                      ) : (
                        <div className="merit-score prominent" style={{ color: CGPA_COLOR(s.cgpa) }}>
                          {Number(s.cgpa).toFixed(2)}
                        </div>
                      )}
                    </td>
                    {!SubjectFilterActive && (
                      <td>
                        <div className="merit-score" style={{ color: CGPA_COLOR(s.currentSGPA) }}>
                          {Number(s.currentSGPA).toFixed(2)}
                        </div>
                      </td>
                    )}
                    {!SubjectFilterActive && (
                      <td>
                        <div className="trend-wrapper">
                          <span className={`trend-icon ${s.trend > 0 ? 'positive' : s.trend < 0 ? 'negative' : ''}`}>
                            {s.trend > 0 ? '↑' : s.trend < 0 ? '↓' : '→'}
                          </span>
                          <span className="trend-value">{Math.abs(Number(s.trend)).toFixed(2)}</span>
                          <div className="sparkline-wrapper">
                            <Sparkline data={sgpaSeries} />
                          </div>
                        </div>
                      </td>
                    )}
                    {SubjectFilterActive && (
                       <td>
                           <div className="merit-score" style={{ color: CGPA_COLOR(s.cgpa) }}>{Number(s.cgpa).toFixed(2)}</div>
                       </td>
                    )}
                    <td>
                      <div className={`fails-badge ${s.failCount === 0 ? 'none' : 'some'}`}>
                        {s.failCount}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {/* Algorithm info */}
          <div className="algorithm-info">
            <strong>Calculation Strategy:</strong> {SubjectFilterActive ? `Subject focus: ${subjectFilter}` : STRATEGY_LABELS[strategy]}
            <p>Ranks are dynamically generated using {SubjectFilterActive ? 'Target Subject Grade Point' : 'Credit-weighted CGPA'} followed by {STRATEGY_LABELS[strategy]}, supported by SHA-256 deterministic tie-breaking for perfect sorting.</p>
          </div>
        </>
      )}
    </div>
  );
}
