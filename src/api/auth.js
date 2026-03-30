import API_BASE from './config';

export const signUp = async (student_id, email, password, extraData = {}) => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id, email, password, ...extraData })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
};

export const signIn = async (identifier, password) => {
  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid credentials');
  localStorage.setItem('token', data.token);
  return data;
};

export const logOut = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentStudent');
};

export const getToken = () => localStorage.getItem('token');
