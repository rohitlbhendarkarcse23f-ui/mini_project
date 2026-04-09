import api from '../api/axiosInstance';

export const getClubs = async () => {
  try { return await api.get('/clubs'); } catch { return []; }
};
export const addClub = async (clubData) => await api.post('/clubs', clubData);
export const deleteClub = async (club_id) => await api.delete(`/clubs/${club_id}`);
export const joinClub = async (club_id, memberData) => await api.post(`/clubs/${club_id}/join`, memberData);
export const getClubMembers = async (club_id) => await api.get(`/clubs/${club_id}/members`);

export const saveClubs = () => {};
