const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

export const getStudentProfile = async (student_id) => {
  const res = await fetch(`${API}/students/${student_id}`, { headers: headers() });
  if (res.status === 404) return null;
  return await res.json();
};

export const saveStudentProfile = async (student_id, data) => {
  const res = await fetch(`${API}/students/${student_id}`, {
    method: 'PUT', headers: headers(), body: JSON.stringify(data)
  });
  return await res.json();
};

export const updateSkills = async (student_id, skills) => {
  const res = await fetch(`${API}/students/${student_id}/skills`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ skills })
  });
  return await res.json();
};

export const updateExperiences = async (student_id, experiences) => {
  const res = await fetch(`${API}/students/${student_id}/experiences`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ experiences })
  });
  return await res.json();
};

export const updateCertificates = async (student_id, certificates) => {
  const res = await fetch(`${API}/students/${student_id}/certificates`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ certificates })
  });
  return await res.json();
};

export const updateMarksheets = async (student_id, marksheets) => {
  const res = await fetch(`${API}/students/${student_id}/marksheets`, {
    method: 'PUT', headers: headers(), body: JSON.stringify({ marksheets })
  });
  return await res.json();
};

export const getAllStudents = async () => {
  const res = await fetch(`${API}/students`, { headers: headers() });
  return await res.json();
};
