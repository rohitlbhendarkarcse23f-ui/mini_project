/**
 * Marksheet Parser — delegates to backend Docling service.
 */

export const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6,
  'C': 5,  'D': 4,  'E': 3, 'F': 0,  'P': 5, 'AB': 0,
};

export const VALID_GRADES = Object.keys(GRADE_POINTS);

export function calculateSGPA(subjects) {
  if (!subjects?.length) return 0;
  let pts = 0, creds = 0;
  for (const s of subjects) {
    pts   += (GRADE_POINTS[s.grade] ?? 0) * (Number(s.credits) || 0);
    creds += Number(s.credits) || 0;
  }
  return creds > 0 ? parseFloat((pts / creds).toFixed(2)) : 0;
}

function normalise(raw) {
  const subjects = (raw.subjects || []).map(s => ({
    code:          String(s.code || '').trim(),
    name:          String(s.name || '').trim(),
    credits:       Number(s.credits) || 3,
    grade:         String(s.grade || '').toUpperCase().trim(),
    gradePoints:   GRADE_POINTS[String(s.grade || '').toUpperCase().trim()] ?? (Number(s.gradePoints) || 0),
    internalMarks: s.internalMarks != null ? Number(s.internalMarks) : null,
    externalMarks: s.externalMarks != null ? Number(s.externalMarks) : null,
    totalMarks:    s.totalMarks    != null ? Number(s.totalMarks)    : null,
    result:        String(s.result || (s.grade === 'F' ? 'FAIL' : 'PASS')).toUpperCase(),
  })).filter(s => s.name.length > 1 && VALID_GRADES.includes(s.grade));

  const sgpa = raw.sgpa > 0 ? parseFloat(Number(raw.sgpa).toFixed(2)) : calculateSGPA(subjects);

  return {
    studentId:    String(raw.studentId || 'UNKNOWN').trim().toUpperCase(),
    studentName:  String(raw.studentName || raw.name || '').trim(),
    semester:     Math.min(8, Math.max(1, parseInt(raw.semester) || 1)),
    branch:       String(raw.branch || raw.department || '').trim(),
    examYear:     raw.examYear ? String(raw.examYear) : null,
    university:   raw.university ? String(raw.university) : null,
    subjects,
    totalCredits: subjects.reduce((s, sub) => s + sub.credits, 0),
    sgpa,
    cgpa:         raw.cgpa ? parseFloat(Number(raw.cgpa).toFixed(2)) : null,
    result:       raw.result ? String(raw.result).toUpperCase() : null,
  };
}

export async function parseMarksheet(file, onProgress) {
  try {
    onProgress?.({ stage: 'docling', message: 'Sending to Docling…' });

    const API  = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API}/marksheet`, { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }

    const raw  = await res.json();
    // Backend already returns { success, data, confidence, method, errors }
    // but data may need normalising if it came through the old path
    const data = normalise(raw.data || raw);
    const confidence = raw.confidence ?? (data.subjects.length >= 3 ? 75 : 30);

    onProgress?.({ stage: 'done', message: 'Extraction complete' });
    return {
      success:    data.subjects.length > 0,
      data,
      confidence,
      method:     raw.method || 'docling',
      errors:     raw.errors || [],
    };
  } catch (err) {
    return { success: false, data: null, confidence: 0, method: 'none', errors: [err.message] };
  }
}
