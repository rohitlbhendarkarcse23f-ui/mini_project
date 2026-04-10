/**
 * Merit-Based Student Ranking System
 * Tie-breaking strategies applied in order:
 *   1. CGPA (overall)
 *   2. Current semester SGPA
 *   3. Chosen strategy (3rd tie-breaker)
 *   4. SHA-256 deterministic micro-precision (final)
 */

export const TIE_BREAK_STRATEGIES = {
  TREND:            'trend',            // Improvement vs previous average
  TOTAL_CREDITS:    'total_credits',    // Total credits earned
  BEST_SUBJECT:     'best_subject',     // Highest single subject grade point
  FEWEST_FAILS:     'fewest_fails',     // Fewest F grades
  WEIGHTED_CREDITS: 'weighted_credits', // Credits-weighted SGPA (true academic load)
  CONSISTENCY:      'consistency',      // Lowest SGPA variance (most consistent)
  HOLISTIC:         'holistic',         // Composite score of CGPA, Trend, Fails, Consistency
};

export const STRATEGY_LABELS = {
  [TIE_BREAK_STRATEGIES.TREND]:            'Improvement Trend',
  [TIE_BREAK_STRATEGIES.TOTAL_CREDITS]:    'Total Credits Earned',
  [TIE_BREAK_STRATEGIES.BEST_SUBJECT]:     'Best Subject Grade',
  [TIE_BREAK_STRATEGIES.FEWEST_FAILS]:     'Fewest Failures',
  [TIE_BREAK_STRATEGIES.WEIGHTED_CREDITS]: 'Credits-Weighted SGPA',
  [TIE_BREAK_STRATEGIES.CONSISTENCY]:      'Academic Consistency',
  [TIE_BREAK_STRATEGIES.HOLISTIC]:         'Holistic Composite Score',
};

export const STRATEGY_DESCRIPTIONS = {
  [TIE_BREAK_STRATEGIES.TREND]:            'Student who improved the most vs their previous average wins',
  [TIE_BREAK_STRATEGIES.TOTAL_CREDITS]:    'Student who completed more credit hours wins',
  [TIE_BREAK_STRATEGIES.BEST_SUBJECT]:     'Student with the highest single subject grade wins',
  [TIE_BREAK_STRATEGIES.FEWEST_FAILS]:     'Student with fewer failed subjects wins',
  [TIE_BREAK_STRATEGIES.WEIGHTED_CREDITS]: 'SGPA weighted by actual credit load per semester wins',
  [TIE_BREAK_STRATEGIES.CONSISTENCY]:      'Student with the most consistent SGPA (lowest variance) wins',
  [TIE_BREAK_STRATEGIES.HOLISTIC]:         'Student with the best overall normalized score across CGPA, Trend, Fails, and Consistency wins',
};

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0 };

// ── SHA-256 deterministic final tie-breaker ───────────────────────
async function calculateMicroPrecision(studentId, sgpaList) {
  const input = `${studentId}|${sgpaList.map(s => s.toFixed(4)).join('|')}`;
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  let hashBigInt = 0n;
  for (const byte of hashArray) hashBigInt = (hashBigInt << 8n) | BigInt(byte);
  return Number(hashBigInt) / Number(2n ** 256n);
}

// ── Core metric calculations ──────────────────────────────────────
export function calculateCGPA(sgpaList, semesterData) {
  if (!semesterData || Object.keys(semesterData).length === 0) {
    const valid = (sgpaList || []).filter(v => v != null && v > 0);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  }
  
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  Object.entries(semesterData).forEach(([sem, subjects]) => {
    const semIdx = parseInt(sem) - 1;
    const sgpa = (sgpaList || [])[semIdx];
    if (sgpa == null || sgpa <= 0) return;
    const credits = (subjects || []).reduce((s, sub) => s + (Number(sub?.credits) || 0), 0);
    if (credits > 0) {
      totalWeightedPoints += sgpa * credits;
      totalCredits += credits;
    }
  });
  
  if (totalCredits > 0) {
    return totalWeightedPoints / totalCredits;
  }
  
  const valid = (sgpaList || []).filter(v => v != null && v > 0);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

export function getCurrentSGPA(sgpaList) {
  const valid = (sgpaList || []).filter(v => v != null && v > 0);
  return valid.length > 0 ? valid[valid.length - 1] : 0;
}

export function calculateTrend(sgpaList) {
  const valid = (sgpaList || []).filter(v => v != null && v > 0);
  if (valid.length <= 1) return 0;
  
  const n = valid.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = valid[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

function calculateTotalCredits(semesterData) {
  if (!semesterData) return 0;
  return Object.values(semesterData)
    .flat()
    .reduce((sum, sub) => sum + (Number(sub?.credits) || 0), 0);
}

function getBestSubjectGrade(semesterData, filterSemester) {
  if (!semesterData) return 0;
  const subjects = filterSemester
    ? (semesterData[filterSemester] || [])
    : Object.values(semesterData).flat();
  if (subjects.length === 0) return 0;
  return Math.max(...subjects.map(s => GRADE_POINTS[s?.grade] ?? 0));
}

function countFails(semesterData, filterSemester) {
  if (!semesterData) return 0;
  const subjects = filterSemester
    ? (semesterData[filterSemester] || [])
    : Object.values(semesterData).flat();
  return subjects.filter(s => s?.grade === 'F').length;
}

// Credits-weighted SGPA: sum(sgpa_i * credits_i) / sum(credits_i)
function calculateWeightedSGPA(sgpaList, semesterData) {
  if (!semesterData || !sgpaList) return calculateCGPA(sgpaList);
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  Object.entries(semesterData).forEach(([sem, subjects]) => {
    const semIdx = parseInt(sem) - 1;
    const sgpa = sgpaList[semIdx];
    if (sgpa == null || sgpa <= 0) return;
    const credits = (subjects || []).reduce((s, sub) => s + (Number(sub?.credits) || 0), 0);
    if (credits > 0) {
      totalWeightedPoints += sgpa * credits;
      totalCredits += credits;
    }
  });
  return totalCredits > 0 ? totalWeightedPoints / totalCredits : calculateCGPA(sgpaList);
}

// Consistency: negative variance (lower variance = more consistent = higher score)
function calculateConsistency(sgpaList) {
  const valid = (sgpaList || []).filter(v => v != null && v > 0);
  if (valid.length <= 1) return 0;
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const variance = valid.reduce((sum, v) => sum + (v - mean) ** 2, 0) / valid.length;
  return -variance; // negative so lower variance ranks higher
}

function calculateHolisticScore(cgpa, trend, fails, consistency) {
  const normalizedCGPA = cgpa / 10.0;
  const normalizedTrend = Math.max(0, Math.min(1, (trend + 2) / 4));
  const normalizedConsistency = Math.max(0, Math.min(1, 1 + consistency / 2));
  const normalizedFails = Math.max(0, Math.min(1, 1 - fails / 5));

  return (normalizedCGPA * 0.55) + 
         (normalizedTrend * 0.20) + 
         (normalizedConsistency * 0.15) + 
         (normalizedFails * 0.10);
}

function getSubjectGradePoint(semesterData, subjectName) {
  if (!semesterData || !subjectName) return 0;
  const q = subjectName.toLowerCase();
  for (const subjects of Object.values(semesterData)) {
    const match = subjects.find(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q));
    if (match) {
        return GRADE_POINTS[match.grade] ?? 0;
    }
  }
  return 0;
}

// ── Per-student semester breakdown for UI ────────────────────────
export function buildSemesterBreakdown(student) {
  const { sgpaList = [], semesterData = {}, marksheets = [] } = student;
  const sems = new Set([
    ...Object.keys(semesterData).map(Number),
    ...marksheets.map(m => m.semester),
    ...sgpaList.map((_, i) => i + 1).filter((_, i) => sgpaList[i] != null && sgpaList[i] > 0),
  ]);
  return Array.from(sems).sort((a, b) => a - b).map(sem => {
    const subjects = semesterData[sem] || marksheets.find(m => m.semester === sem)?.subjects || [];
    const sgpa = sgpaList[sem - 1] ?? marksheets.find(m => m.semester === sem)?.sgpa ?? 0;
    const totalCredits = subjects.reduce((s, sub) => s + (Number(sub?.credits) || 0), 0);
    return { sem, sgpa, subjects, totalCredits };
  });
}

// ── Main ranking engine ───────────────────────────────────────────
async function calculateMeritMetrics(student, strategy, filterSemester, filterYear = null, filterSubject = null) {
  const rawSgpa = student.sgpaList || [];
  // Year filter takes precedence: slice to year's semester range
  const scopedRaw = filterYear
    ? rawSgpa.slice(YEAR_SEM_RANGES[filterYear][0] - 1, YEAR_SEM_RANGES[filterYear][1])
    : rawSgpa;
  const sgpaList = filterSemester
    ? scopedRaw.slice(0, filterSemester).filter(v => v != null && v > 0)
    : scopedRaw.filter(v => v != null && v > 0);

  const cgpa = calculateCGPA(sgpaList, student.semesterData);
  const currentSGPA = filterSemester
    ? (scopedRaw[filterSemester - 1] || 0)
    : getCurrentSGPA(scopedRaw);
  const trend = calculateTrend(sgpaList);
  const failsCount = countFails(student.semesterData, filterSemester);
  const consistencyScore = calculateConsistency(sgpaList);
  
  const microPrecision = sgpaList.length > 0
    ? await calculateMicroPrecision(student.id || student.student_id, sgpaList)
    : 0;

  const subjectGrade = filterSubject ? getSubjectGradePoint(student.semesterData, filterSubject) : 0;

  let tieBreaker3 = 0;
  switch (strategy) {
    case TIE_BREAK_STRATEGIES.TOTAL_CREDITS:
      tieBreaker3 = calculateTotalCredits(student.semesterData);
      break;
    case TIE_BREAK_STRATEGIES.BEST_SUBJECT:
      tieBreaker3 = getBestSubjectGrade(student.semesterData, filterSemester);
      break;
    case TIE_BREAK_STRATEGIES.FEWEST_FAILS:
      tieBreaker3 = -failsCount;
      break;
    case TIE_BREAK_STRATEGIES.WEIGHTED_CREDITS:
      tieBreaker3 = calculateWeightedSGPA(rawSgpa, student.semesterData);
      break;
    case TIE_BREAK_STRATEGIES.CONSISTENCY:
      tieBreaker3 = consistencyScore;
      break;
    case TIE_BREAK_STRATEGIES.HOLISTIC:
      tieBreaker3 = calculateHolisticScore(cgpa, trend, failsCount, consistencyScore);
      break;
    case TIE_BREAK_STRATEGIES.TREND:
    default:
      tieBreaker3 = trend;
  }

  const semesterBreakdown = buildSemesterBreakdown(student);

  return {
    ...student,
    cgpa,
    currentSGPA,
    trend,
    tieBreaker3,
    microPrecision,
    subjectGrade,
    semesterBreakdown,
    totalCredits: calculateTotalCredits(student.semesterData),
    weightedSGPA: calculateWeightedSGPA(rawSgpa, student.semesterData),
    consistency: consistencyScore,
    failCount: failsCount,
  };
}

function compareStudents(a, b, filterSubject) {
  if (filterSubject) {
    if (Math.abs(a.subjectGrade - b.subjectGrade) > 0.0001) return b.subjectGrade - a.subjectGrade;
  }
  if (Math.abs(a.cgpa - b.cgpa) > 0.0001) return b.cgpa - a.cgpa;
  if (Math.abs(a.currentSGPA - b.currentSGPA) > 0.0001) return b.currentSGPA - a.currentSGPA;
  if (Math.abs(a.tieBreaker3 - b.tieBreaker3) > 0.0001) return b.tieBreaker3 - a.tieBreaker3;
  return b.microPrecision - a.microPrecision;
}

// Academic year → semester range (1st year = sems 1-2, 2nd = 3-4, etc.)
export const YEAR_SEM_RANGES = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

// Returns SGPA list scoped to a year's semester range
export function getSgpaForYear(sgpaList, year) {
  if (!year) return sgpaList;
  const [start, end] = YEAR_SEM_RANGES[year];
  return (sgpaList || []).slice(start - 1, end);
}

export async function sortStudentsByMerit(students, strategy = TIE_BREAK_STRATEGIES.TREND, filterSemester = null, filterYear = null, filterSubject = null) {
  if (!students || students.length === 0) return [];
  // If year filter is set, derive effective semester from year range end
  const effectiveSemester = filterYear && !filterSemester
    ? YEAR_SEM_RANGES[filterYear]?.[1]
    : filterSemester;

  const withMetrics = await Promise.all(
    students.map(s => calculateMeritMetrics(s, strategy, effectiveSemester, filterYear, filterSubject))
  );
  return withMetrics.sort((a, b) => compareStudents(a, b, filterSubject)).map((s, i) => ({ ...s, rank: i + 1 }));
}

export async function getStudentRank(targetStudent, allStudents, strategy, filterSemester) {
  const sorted = await sortStudentsByMerit(allStudents, strategy, filterSemester);
  return sorted.find(s => (s.id || s.student_id) === (targetStudent.id || targetStudent.student_id));
}
