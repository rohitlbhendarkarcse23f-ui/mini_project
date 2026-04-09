import api from './axiosInstance';

export const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  const data = await api.post(`/upload/${type}`, formData);
  return data; // { url, filename }
};

// ── Student Profile ──────────────────────────────────────────────
export const getStudentProfile = async (student_id) => {
  try { return await api.get(`/students/${student_id}`); } catch { return null; }
};
export const saveStudentProfile = async (student_id, data) => await api.put(`/students/${student_id}`, data);
export const saveSkills = async (student_id, skills) => await api.put(`/students/${student_id}/skills`, { skills });
export const saveExperiences = async (student_id, experiences) => await api.put(`/students/${student_id}/experiences`, { experiences });
export const saveCertificates = async (student_id, certificates) => await api.put(`/students/${student_id}/certificates`, { certificates });
export const saveMarksheets = async (student_id, marksheets) => await api.put(`/students/${student_id}/marksheets`, { marksheets });
export const registerForEvent = async (student_id, event_id) => await api.post(`/students/${student_id}/events/${event_id}`);
export const joinClubDB = async (student_id, club_id) => await api.post(`/students/${student_id}/clubs/${club_id}`);
export const applyForJobDB = async (student_id, job_id) => await api.post(`/students/${student_id}/jobs/${job_id}`);

export const getAllStudents = async () => {
  try { return await api.get('/students'); } catch { return []; }
};
export const getStudentMarksheets = async () => {
  try { return await api.get('/teachers/marksheets/all'); } catch { return []; }
};
export const fetchMarksheetFile = async (fileUrl) => {
  // We can't automatically unpack interceptor data if expecting a blob, so we do a standard fetch for blob handling,
  // or use axios with responseType: 'blob'. Let's use axios correctly.
  const response = await api.get(`/teachers/marksheets/file?url=${encodeURIComponent(fileUrl)}`, { responseType: 'blob' });
  const filename = fileUrl.split('/').pop();
  return new File([response], filename, { type: response.type || 'application/pdf' });
};

// ── Teacher Profile ──────────────────────────────────────────────
export const getTeacherProfile = async (teacher_id) => {
  try { return await api.get(`/teachers/${teacher_id}`); } catch { return null; }
};
export const saveTeacherProfile = async (teacher_id, data) => await api.put(`/teachers/${teacher_id}`, data);

// ── Recruiter Profile ────────────────────────────────────────────
export const getRecruiterProfile = async (company_id) => {
  try { return await api.get(`/recruiter/profile/${company_id}`); } catch { return null; }
};
export const saveRecruiterProfile = async (company_id, data) => await api.put(`/recruiter/profile/${company_id}`, data);
