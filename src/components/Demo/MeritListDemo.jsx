import { useState, useEffect, useCallback } from 'react';
import { sortStudentsByMerit, TIE_BREAK_STRATEGIES, STRATEGY_LABELS, STRATEGY_DESCRIPTIONS, YEAR_SEM_RANGES } from '../../utils/meritSort';
import { getAllStudents, getStudentMarksheets, fetchMarksheetFile, saveMarksheets, saveStudentProfile } from '../../api/profiles';
import { parseMarksheet, calculateSGPA } from '../../utils/aiMarksheetExtractor';
import '../Teacher/MeritList.css';

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0 };
const GRADE_COLOR  = { 'O': '#22c55e', 'A+': '#3b82f6', 'A': '#06b6d4', 'B+': '#f59e0b', 'B': '#f97316', 'C': '#ef4444', 'D': '#dc2626', 'F': '#7f1d1d' };

const MeritListDemo = () => {
  const [rankedStudents, setRankedStudents]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [strategy, setStrategy]               = useState(TIE_BREAK_STRATEGIES.TREND);
  const [filterSemester, setFilterSemester]   = useState('');
  const [filterYear, setFilterYear]           = useState('');
  const [filterDept, setFilterDept]           = useState('All');
  const [searchTerm, setSearchTerm]           = useState('');
  const [expandedRow, setExpandedRow]         = useState(null);
  const [dataSource, setDataSource]           = useState('');  // 'api' | 'local' | 'mixed'

  // ── AI Parse state ────────────────────────────────────────────
  const [parseModal, setParseModal]   = useState(false);
  const [parseList, setParseList]     = useState([]);   // [{ student_id, name, semester, file_url, status, msg }]
  const [parseSummary, setParseSummary] = useState(null);

  // ── Open parse modal: load students with files ──────────────
  const openParseModal = async () => {
    setParseModal(true);
    setParseSummary(null);
    try {
      const data = await getStudentMarksheets();
      const rows = [];
      (Array.isArray(data) ? data : []).forEach(s =>
        s.marksheets.filter(m => m.hasFile).forEach(m =>
          rows.push({ student_id: s.student_id, name: s.name, department: s.department, semester: m.semester, file_url: m.file_url, status: 'pending', msg: '' })
        )
      );
      setParseList(rows);
    } catch { setParseList([]); }
  };

  // ── Run AI parse on all pending rows ─────────────────────────
  const runParseAll = async () => {
    let saved = 0, failed = 0;
    for (let i = 0; i < parseList.length; i++) {
      const row = parseList[i];
      if (row.status === 'done') continue;
      // Small delay between requests to avoid Gemini rate limit (15 RPM free tier)
      if (i > 0) await new Promise(r => setTimeout(r, 4500));
      setParseList(p => p.map((r, idx) => idx === i ? { ...r, status: 'parsing', msg: 'Fetching file…' } : r));
      try {
        const file   = await fetchMarksheetFile(row.file_url);
        setParseList(p => p.map((r, idx) => idx === i ? { ...r, msg: 'Running AI…' } : r));
        const result = await parseMarksheet(file, ({ message }) =>
          setParseList(p => p.map((r, idx) => idx === i ? { ...r, msg: message } : r))
        );
        if (!result.success) throw new Error(result.errors[0] || 'Parse failed');

        const data = result.data;
        data.studentId   = row.student_id;
        data.studentName = data.studentName || row.name;
        data.branch      = data.branch      || row.department;
        data.semester    = data.semester    || row.semester;

        // Persist to localStorage
        const profiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');
        const cur = profiles[row.student_id] || {};
        const sgpaList = [...(cur.sgpaList || [])];
        sgpaList[data.semester - 1] = data.sgpa;
        const semesterData = { ...(cur.semesterData || {}), [data.semester]: data.subjects };
        const valid = sgpaList.filter(v => v != null && v > 0);
        const cgpa  = valid.length ? parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)) : data.sgpa;
        profiles[row.student_id] = { ...cur, student_id: row.student_id, name: data.studentName, department: data.branch, cgpa, sgpaList, semesterData };
        localStorage.setItem('studentProfiles', JSON.stringify(profiles));
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const idx2 = students.findIndex(s => s.student_id === row.student_id);
        const entry = { student_id: row.student_id, name: data.studentName, department: data.branch, cgpa, sgpaList, semesterData };
        if (idx2 >= 0) students[idx2] = { ...students[idx2], ...entry }; else students.push(entry);
        localStorage.setItem('students', JSON.stringify(students));

        // Persist to API
        const marksheetArr = Object.entries(semesterData).map(([sem, subs]) => ({
          semester: parseInt(sem), sgpa: sgpaList[parseInt(sem) - 1] || 0, subjects: subs,
        }));
        await Promise.allSettled([
          saveMarksheets(row.student_id, marksheetArr),
          saveStudentProfile(row.student_id, { name: data.studentName, department: data.branch, cgpa, sgpaList, semesterData }),
        ]);

        setParseList(p => p.map((r, idx) => idx === i ? { ...r, status: 'done', msg: `SGPA ${data.sgpa} · ${data.subjects.length} subjects` } : r));
        saved++;
      } catch (err) {
        setParseList(p => p.map((r, idx) => idx === i ? { ...r, status: 'error', msg: err.message } : r));
        failed++;
      }
    }
    setParseSummary({ saved, failed });
    window.dispatchEvent(new Event('storage'));
    loadStudents();
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      // ── 1. Read everything from localStorage first (always available) ──
      const localRaw      = JSON.parse(localStorage.getItem('students') || '[]');
      const localProfiles = JSON.parse(localStorage.getItem('studentProfiles') || '{}');

      // Build a map from localStorage — studentProfiles is the most complete source
      const merged = new Map();

      // Add from studentProfiles (most complete — has sgpaList + semesterData)
      Object.entries(localProfiles).forEach(([sid, profile]) => {
        if (!sid) return;
        merged.set(sid, {
          id:           sid,
          student_id:   sid,
          name:         profile.name || sid,
          email:        profile.email || '',
          dept:         profile.department || 'N/A',
          sgpaList:     profile.sgpaList || [],
          semesterData: profile.semesterData || {},
          marksheets:   [],
          cgpa:         profile.cgpa || 0,
        });
      });

      // Fill gaps from students array
      localRaw.forEach(s => {
        if (!s.student_id) return;
        const existing = merged.get(s.student_id);
        if (existing) {
          // Merge: prefer whichever has more sgpa data
          if ((s.sgpaList || []).filter(Boolean).length > (existing.sgpaList || []).filter(Boolean).length) {
            merged.set(s.student_id, { ...existing, sgpaList: s.sgpaList, semesterData: s.semesterData || existing.semesterData, cgpa: s.cgpa || existing.cgpa });
          }
        } else {
          merged.set(s.student_id, {
            id:           s.student_id,
            student_id:   s.student_id,
            name:         s.name || s.email?.split('@')[0] || s.student_id,
            email:        s.email || '',
            dept:         s.department || 'N/A',
            sgpaList:     s.sgpaList || [],
            semesterData: s.semesterData || {},
            marksheets:   [],
            cgpa:         s.cgpa || 0,
          });
        }
      });

      // ── 2. Try to fetch from API and merge (API is source of truth) ──
      let apiStudents = [];
      try {
        apiStudents = await getAllStudents();
        if (!Array.isArray(apiStudents)) apiStudents = [];
      } catch (_) {}

      apiStudents.forEach(s => {
        if (!s.student_id) return;
        const local = merged.get(s.student_id) || {};
        // Use API data but fall back to localStorage for missing fields
        const apiSgpa = (s.sgpaList || []).filter(v => v != null && v > 0);
        const localSgpa = (local.sgpaList || []).filter(v => v != null && v > 0);
        const bestSgpa = apiSgpa.length >= localSgpa.length ? s.sgpaList : local.sgpaList;
        const apiSemData = s.semesterData && Object.keys(s.semesterData).length > 0 ? s.semesterData : null;
        const localSemData = local.semesterData && Object.keys(local.semesterData || {}).length > 0 ? local.semesterData : null;
        // Reconstruct sgpaList from marksheets[] if sgpaList is missing/empty
        let resolvedSgpa = bestSgpa || [];
        if (!resolvedSgpa.some(v => v != null && v > 0) && s.marksheets?.length > 0) {
          resolvedSgpa = [];
          s.marksheets.forEach(m => {
            if (m.semester >= 1 && m.sgpa > 0) resolvedSgpa[m.semester - 1] = m.sgpa;
          });
        }
        // Reconstruct semesterData from marksheets[] if missing
        let resolvedSemData = apiSemData || localSemData || {};
        if (!Object.keys(resolvedSemData).length && s.marksheets?.length > 0) {
          s.marksheets.forEach(m => {
            if (m.semester >= 1 && m.subjects?.length > 0) resolvedSemData[m.semester] = m.subjects;
          });
        }
        merged.set(s.student_id, {
          id:           s.student_id,
          student_id:   s.student_id,
          name:         s.name || local.name || s.email?.split('@')[0] || s.student_id,
          email:        s.email || local.email || '',
          dept:         s.department || local.dept || 'N/A',
          sgpaList:     resolvedSgpa,
          semesterData: resolvedSemData,
          marksheets:   s.marksheets || [],
          cgpa:         s.cgpa || local.cgpa || 0,
        });
      });

      // ── 3. Filter to students with at least one valid SGPA ──
      const students = Array.from(merged.values()).filter(
        s => (s.sgpaList || []).some(v => v != null && v > 0)
      );

      const hasApi   = apiStudents.some(s => (s.sgpaList || []).some(v => v > 0));
      const hasLocal = merged.size > 0 && students.length > 0;
      setDataSource(hasApi && hasLocal ? 'mixed' : hasApi ? 'api' : hasLocal ? 'local' : '');

      if (students.length === 0) {
        setRankedStudents([]);
        setLoading(false);
        return;
      }

      const sem    = filterSemester ? parseInt(filterSemester) : null;
      const yr     = filterYear ? parseInt(filterYear) : null;
      const ranked = await sortStudentsByMerit(students, strategy, sem, yr);
      setRankedStudents(ranked);
    } catch (_) {
      setRankedStudents([]);
    }
    setLoading(false);
  }, [strategy, filterSemester, filterYear]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Re-rank when localStorage changes (student uploads marksheet)
  useEffect(() => {
    window.addEventListener('storage', loadStudents);
    return () => window.removeEventListener('storage', loadStudents);
  }, [loadStudents]);

  const departments = ['All', ...new Set(rankedStudents.map(s => s.dept).filter(d => d && d !== 'N/A'))];

  const filtered = rankedStudents
    .filter(s => {
      const matchDept   = filterDept === 'All' || s.dept === filterDept;
      const matchSearch = !searchTerm ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchSearch;
    })
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const avgCGPA = filtered.length
    ? (filtered.reduce((s, st) => s + st.cgpa, 0) / filtered.length).toFixed(2)
    : '—';

  const closeParseModal = () => { setParseModal(false); setParseList([]); setParseSummary(null); };

  const handleExport = () => {
    if (!filtered.length) return;
    const rows = [
      ['Rank', 'Student ID', 'Name', 'Department', 'CGPA', 'Current SGPA', 'Weighted SGPA', 'Trend', 'Total Credits', 'Fails'],
      ...filtered.map(s => [
        s.rank, s.id, s.name, s.dept,
        s.cgpa.toFixed(2), s.currentSGPA.toFixed(2),
        s.weightedSGPA.toFixed(2),
        s.trend.toFixed(2), s.totalCredits, s.failCount
      ])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const scope = filterYear ? `year${filterYear}` : filterSemester ? `sem${filterSemester}` : 'all';
    a.download = `merit_list_${scope}_${strategy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  const trendColor = (t) => t > 0.5 ? '#22c55e' : t > 0 ? '#86efac' : t > -0.5 ? '#fbbf24' : '#ef4444';
  const cgpaColor  = (c) => c >= 8.5 ? '#22c55e' : c >= 7 ? '#3b82f6' : c >= 5.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="merit-list-container">

      {/* ── AI Parse Modal ── */}
      {parseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={closeParseModal}>
          <div style={{ background: '#13162a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 18, padding: '28px 28px 24px', width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'white' }}>🤖 AI Parse Student Marksheets</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{parseList.length} marksheet file{parseList.length !== 1 ? 's' : ''} found</div>
              </div>
              <button onClick={closeParseModal} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            {parseSummary && (
              <div style={{ padding: '10px 14px', background: parseSummary.failed === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${parseSummary.failed === 0 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`, borderRadius: 10, fontSize: 13, color: parseSummary.failed === 0 ? '#4ade80' : '#fbbf24' }}>
                ✅ {parseSummary.saved} saved{parseSummary.failed > 0 ? ` · ⚠️ ${parseSummary.failed} failed` : ''} — Merit list updated
              </div>
            )}

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {parseList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No marksheet files uploaded by students yet.</div>
              )}
              {parseList.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${row.status === 'done' ? 'rgba(34,197,94,0.2)' : row.status === 'error' ? 'rgba(239,68,68,0.2)' : row.status === 'parsing' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{row.name || row.student_id} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>· Sem {row.semester}</span></div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{row.student_id}</div>
                  </div>
                  <div style={{ fontSize: 11, textAlign: 'right', maxWidth: 160 }}>
                    {row.status === 'pending'  && <span style={{ color: 'rgba(255,255,255,0.3)' }}>Pending</span>}
                    {row.status === 'parsing'  && <span style={{ color: '#fbbf24' }}>{row.msg || 'Parsing…'}</span>}
                    {row.status === 'done'     && <span style={{ color: '#4ade80' }}>{row.msg}</span>}
                    {row.status === 'error'    && <span style={{ color: '#f87171' }}>⚠ {row.msg}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {!parseSummary && parseList.length > 0 && (
                <button onClick={runParseAll} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  ⚡ Parse All & Update Merit List
                </button>
              )}
              <button onClick={closeParseModal} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="merit-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
              Merit-Based Student Rankings
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Scope: <strong style={{ color: 'rgba(255,255,255,0.75)' }}>
                {filterYear ? `Year ${filterYear} (Sem ${YEAR_SEM_RANGES[filterYear][0]}–${YEAR_SEM_RANGES[filterYear][1]})` : filterSemester ? `Semester ${filterSemester}` : 'All Semesters'}
              </strong> · Dept: <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{filterDept}</strong> · Tie-break: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{STRATEGY_LABELS[strategy]}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {dataSource && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: dataSource === 'api' ? 'rgba(34,197,94,0.15)' : dataSource === 'mixed' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: dataSource === 'api' ? '#4ade80' : dataSource === 'mixed' ? '#60a5fa' : '#fbbf24', border: `1px solid ${dataSource === 'api' ? 'rgba(34,197,94,0.3)' : dataSource === 'mixed' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                {dataSource === 'api' ? '● Live DB' : dataSource === 'mixed' ? '● DB + Local' : '● Local Only'}
              </span>
            )}
            <button onClick={openParseModal} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 9, color: '#a5b4fc', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              AI Parse
            </button>
            <button className="export-btn" onClick={handleExport} disabled={!filtered.length}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Strategy info banner */}
      <div style={{ padding: '10px 16px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
        <strong style={{ color: '#a78bfa' }}>Tie-breaker 3 — {STRATEGY_LABELS[strategy]}:</strong> {STRATEGY_DESCRIPTIONS[strategy]}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="merit-search"
          style={{ flex: 1, minWidth: '160px' }}
        />
        <select
          value={filterYear}
          onChange={e => { setFilterYear(e.target.value); setFilterSemester(''); }}
          className="merit-select" style={{ color: 'white' }}
        >
          <option value="">All Years</option>
          {[1,2,3,4].map(y => (
            <option key={y} value={y} style={{ background: '#1a1d2e' }}>
              Year {y} (Sem {YEAR_SEM_RANGES[y][0]}–{YEAR_SEM_RANGES[y][1]})
            </option>
          ))}
        </select>
        <select
          value={filterSemester}
          onChange={e => { setFilterSemester(e.target.value); setFilterYear(''); }}
          className="merit-select" style={{ color: 'white' }}
        >
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} style={{ background: '#1a1d2e' }}>Semester {s}</option>)}
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="merit-select" style={{ color: 'white' }}>
          {departments.map(d => <option key={d} value={d} style={{ background: '#1a1d2e' }}>{d}</option>)}
        </select>
        <select value={strategy} onChange={e => setStrategy(e.target.value)} className="merit-select" style={{ color: 'white', minWidth: '200px' }}>
          {Object.entries(STRATEGY_LABELS).map(([val, label]) => (
            <option key={val} value={val} style={{ background: '#1a1d2e' }}>Tie-break: {label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Calculating merit rankings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.3 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <p style={{ fontSize: '15px', marginBottom: '6px' }}>No students with marksheet data found.</p>
          <p style={{ fontSize: '13px' }}>Students need to upload their marksheets first.</p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="merit-stats" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Total Students', value: filtered.length, color: '#8b5cf6' },
              { label: 'Top CGPA',       value: filtered[0]?.cgpa.toFixed(2) ?? '—', color: '#22c55e' },
              { label: 'Average CGPA',   value: avgCGPA, color: '#3b82f6' },
              { label: 'Top Student',    value: filtered[0]?.name?.split(' ')[0] ?? '—', color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-box">
                <span className="stat-label">{label}</span>
                <span className="stat-value" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Top 3 podium */}
          {filtered.length >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(filtered.length, 3)}, 1fr)`, gap: '16px', marginBottom: '24px' }}>
              {filtered.slice(0, 3).map(s => (
                <div key={s.id} style={{ textAlign: 'center', padding: '24px 16px', background: s.rank === 1 ? 'rgba(251,191,36,0.08)' : s.rank === 2 ? 'rgba(156,163,175,0.08)' : 'rgba(205,127,50,0.08)', borderRadius: '14px', border: `1px solid ${s.rank === 1 ? 'rgba(251,191,36,0.25)' : s.rank === 2 ? 'rgba(156,163,175,0.25)' : 'rgba(205,127,50,0.25)'}` }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : '🥉'}</div>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px' }}>{s.id} · {s.dept}</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: cgpaColor(s.cgpa) }}>{s.cgpa.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>CGPA / 10.0</div>
                  {s.semesterBreakdown.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {s.semesterBreakdown.map(({ sem, sgpa }) => (
                        <span key={sem} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                          S{sem}: {sgpa.toFixed(1)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="merit-table-wrapper">
            <table className="merit-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Student</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Current SGPA</th>
                  <th>Trend</th>
                  <th>Credits</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <>
                    <tr key={s.id} onClick={() => toggleRow(s.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <span className={`rank-badge ${s.rank === 1 ? 'rank-gold' : s.rank === 2 ? 'rank-silver' : s.rank === 3 ? 'rank-bronze' : 'rank-default'}`}>
                          #{s.rank}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>{s.id}</div>
                      </td>
                      <td className="dept-cell">{s.dept}</td>
                      <td>
                        <span className="cgpa-value" style={{ color: cgpaColor(s.cgpa) }}>{s.cgpa.toFixed(2)}</span>
                      </td>
                      <td className="sgpa-cell">{s.currentSGPA.toFixed(2)}</td>
                      <td>
                        <span style={{ color: trendColor(s.trend), fontWeight: '600', fontSize: '13px' }}>
                          {s.trend >= 0 ? '▲' : '▼'} {Math.abs(s.trend).toFixed(2)}
                        </span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{s.totalCredits}</td>
                      <td>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ transform: expandedRow === s.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </td>
                    </tr>

                    {/* Expanded semester breakdown */}
                    {expandedRow === s.id && (
                      <tr key={`${s.id}-expanded`} className="expanded-row">
                        <td colSpan={8} style={{ padding: '0' }}>
                          <div className="semester-breakdown">
                            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {[
                                  { label: 'Weighted SGPA', value: s.weightedSGPA.toFixed(2), color: '#8b5cf6' },
                                  { label: 'Total Credits',  value: s.totalCredits, color: '#3b82f6' },
                                  { label: 'Failed Subjects', value: s.failCount, color: s.failCount > 0 ? '#ef4444' : '#22c55e' },
                                  { label: 'Semesters',      value: s.semesterBreakdown.length, color: '#f59e0b' },
                                ].map(({ label, value, color }) => (
                                  <div key={label} style={{ textAlign: 'center', minWidth: '90px' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{label}</div>
                                  </div>
                                ))}
                              </div>

                              {s.semesterBreakdown.length === 0 ? (
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>No semester data available.</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {s.semesterBreakdown.map(({ sem, sgpa, subjects, totalCredits }) => (
                                    <div key={sem} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: subjects.length ? '10px' : '0' }}>
                                        <span style={{ fontWeight: '600', fontSize: '13px' }}>Semester {sem}</span>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                          <span>{totalCredits} credits</span>
                                          <span style={{ color: cgpaColor(sgpa), fontWeight: '700' }}>SGPA: {sgpa.toFixed(2)}</span>
                                        </div>
                                      </div>
                                      {subjects.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                          {subjects.map((sub, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px' }}>
                                              <span style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</span>
                                              <span style={{ color: 'rgba(255,255,255,0.35)' }}>{sub.credits}cr</span>
                                              <span style={{ fontWeight: '700', color: GRADE_COLOR[sub.grade] || 'white' }}>{sub.grade}</span>
                                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>({GRADE_POINTS[sub.grade] ?? '?'})</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Algorithm info */}
          <div className="merit-footer">
            <div className="algorithm-info">
              <h4>Ranking Algorithm</h4>
              <ol>
                <li><strong>Step 1 — CGPA:</strong> Overall average of all uploaded semester SGPAs</li>
                <li><strong>Step 2 — Current SGPA:</strong> Most recent semester's SGPA</li>
                <li><strong>Step 3 — {STRATEGY_LABELS[strategy]}:</strong> {STRATEGY_DESCRIPTIONS[strategy]}</li>
                <li><strong>Step 4 — SHA-256:</strong> Deterministic hash of student ID + SGPA history ensures no two students ever share a rank</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MeritListDemo;
