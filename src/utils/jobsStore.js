import api from '../api/axiosInstance';

export const getJobs = async () => {
  try { return await api.get('/jobs?type=Placement'); } catch { return []; }
};
export const getInternships = async () => {
  try { return await api.get('/jobs?type=Internship'); } catch { return []; }
};
export const getRecruiterJobs = async (company_id) => {
  try { return await api.get(`/jobs/recruiter/${company_id}`); } catch { return []; }
};
export const addJob = async (jobData) => await api.post('/jobs', jobData);
export const deleteJob = async (job_id) => await api.delete(`/jobs/${job_id}`);

export const getApplicantCounts = async (company_id) => {
  try { return await api.get(`/jobs/applicant-counts/${company_id}`); } catch { return {}; }
};
export const getApplicants = async (company_id) => await api.get(`/jobs/applicants/${company_id}`);
export const applyForJob = async (job_id, student_id) => await api.post(`/jobs/${job_id}/apply`, { student_id });
export const updateApplicationStatus = async (app_id, status) => await api.patch(`/jobs/${app_id}/status`, { status });
export const searchCandidates = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return await api.get(`/jobs/candidates/search?${params}`);
};

export const saveJobs = () => {};
export const saveInternships = () => {};
