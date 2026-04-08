const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export const getJobs = async () => {
  try {
    const res = await fetch(`${API}/jobs?type=Placement`);
    return await res.json();
  } catch { return []; }
};

export const getInternships = async () => {
  try {
    const res = await fetch(`${API}/jobs?type=Internship`);
    return await res.json();
  } catch { return []; }
};

export const getRecruiterJobs = async (company_id) => {
  try {
    const res = await fetch(`${API}/jobs/recruiter/${company_id}`, {
      headers: { Authorization: `Bearer ${token()}` }
    });
    return await res.json();
  } catch { return []; }
};

export const addJob = async (jobData) => {
  const res = await fetch(`${API}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(jobData)
  });
  return await res.json();
};

export const deleteJob = async (job_id) => {
  await fetch(`${API}/jobs/${job_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` }
  });
};

export const getApplicantCounts = async (company_id) => {
  try {
    const res = await fetch(`${API}/jobs/applicant-counts/${company_id}`, {
      headers: { Authorization: `Bearer ${token()}` }
    });
    return await res.json();
  } catch { return {}; }
};

export const getApplicants = async (company_id) => {
  const res = await fetch(`${API}/jobs/applicants/${company_id}`, {
    headers: { Authorization: `Bearer ${token()}` }
  });
  return await res.json();
};

export const applyForJob = async (job_id, student_id) => {
  const res = await fetch(`${API}/jobs/${job_id}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ student_id })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Apply failed');
  return data;
};

export const updateApplicationStatus = async (app_id, status) => {
  const res = await fetch(`${API}/jobs/${app_id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ status })
  });
  return await res.json();
};

export const searchCandidates = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API}/jobs/candidates/search?${params}`, {
    headers: { Authorization: `Bearer ${token()}` }
  });
  return await res.json();
};

// Legacy sync fallbacks
export const saveJobs = () => {};
export const saveInternships = () => {};
