import api from './axiosInstance';

export const signUp = async (student_id, email, password, extraData = {}) => {
  return await api.post('/auth/signup', { student_id, email, password, ...extraData });
};

export const signIn = async (identifier, password) => {
  const data = await api.post('/auth/signin', { identifier, password });
  localStorage.setItem('token', data.token);
  return data;
};

export const logOut = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentStudent');
};

export const getToken = () => localStorage.getItem('token');
