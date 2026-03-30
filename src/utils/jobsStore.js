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

export const getRecruiterJobs = async (recruiter_id) => {
  try {
    const res = await fetch(`${API}/jobs/recruiter/${recruiter_id}`, {
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

export const applyForJob = async (job_id, student_id) => {
  const res = await fetch(`${API}/jobs/${job_id}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ student_id })
  });
  return await res.json();
};

export const getApplicants = async (recruiter_id) => {
  const res = await fetch(`${API}/jobs/applicants/${recruiter_id}`, {
    headers: { Authorization: `Bearer ${token()}` }
  });
  return await res.json();
};

// Legacy sync fallbacks
export const saveJobs = () => {};
export const saveInternships = () => {};
