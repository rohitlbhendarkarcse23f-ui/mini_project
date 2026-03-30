const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export const getClubs = async () => {
  try {
    const res = await fetch(`${API}/clubs`);
    return await res.json();
  } catch { return []; }
};

export const addClub = async (clubData) => {
  const res = await fetch(`${API}/clubs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(clubData)
  });
  return await res.json();
};

export const deleteClub = async (club_id) => {
  await fetch(`${API}/clubs/${club_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` }
  });
};

export const joinClub = async (club_id, memberData) => {
  const res = await fetch(`${API}/clubs/${club_id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(memberData)
  });
  return await res.json();
};

export const getClubMembers = async (club_id) => {
  const res = await fetch(`${API}/clubs/${club_id}/members`, {
    headers: { Authorization: `Bearer ${token()}` }
  });
  return await res.json();
};

// Legacy sync fallback
export const saveClubs = () => {};
