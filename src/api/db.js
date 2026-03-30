import API_BASE from './config';
import { getToken } from './auth';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

export const createDocument = async (collection, id, data) => {
  const res = await fetch(`${API_BASE}/db/${collection}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Create failed');
  return result;
};

export const getDocument = async (collection, id) => {
  const res = await fetch(`${API_BASE}/db/${collection}/${id}`, { headers: authHeaders() });
  if (res.status === 404) return null;
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Get failed');
  return result;
};

export const getAllDocuments = async (collection) => {
  const res = await fetch(`${API_BASE}/db/${collection}`, { headers: authHeaders() });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Get all failed');
  return result;
};

export const updateDocument = async (collection, id, data) => {
  const res = await fetch(`${API_BASE}/db/${collection}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Update failed');
  return result;
};

export const deleteDocument = async (collection, id) => {
  const res = await fetch(`${API_BASE}/db/${collection}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Delete failed');
  return result;
};
