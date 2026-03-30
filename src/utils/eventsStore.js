const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export const getEvents = async () => {
  try {
    const res = await fetch(`${API}/events`);
    return await res.json();
  } catch { return []; }
};

export const saveEvents = async (events) => {
  // events are saved individually via POST /api/events
};

export const addEvent = async (eventData) => {
  const res = await fetch(`${API}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(eventData)
  });
  return await res.json();
};

export const removeEvent = async (event_id) => {
  await fetch(`${API}/events/${event_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` }
  });
};

export const registerForEvent = async (event_id, studentData) => {
  const res = await fetch(`${API}/events/${event_id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(studentData)
  });
  return await res.json();
};

export const getEventRegistrations = async (event_id) => {
  const res = await fetch(`${API}/events/${event_id}/registrations`, {
    headers: { Authorization: `Bearer ${token()}` }
  });
  return await res.json();
};

// Legacy sync fallbacks for components not yet migrated
export const getRemovedEvents = () => [];
export const saveRemovedEvents = () => {};
