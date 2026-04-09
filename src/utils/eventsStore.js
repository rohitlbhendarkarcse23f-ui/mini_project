import api from '../api/axiosInstance';

export const getEvents = async () => {
  try { return await api.get('/events'); } catch { return []; }
};
export const saveEvents = async () => {};
export const addEvent = async (eventData) => await api.post('/events', eventData);
export const removeEvent = async (event_id) => await api.delete(`/events/${event_id}`);
export const registerForEvent = async (event_id, studentData) => await api.post(`/events/${event_id}/register`, studentData);
export const getEventRegistrations = async (event_id) => await api.get(`/events/${event_id}/registrations`);

export const getRemovedEvents = () => [];
export const saveRemovedEvents = () => {};
