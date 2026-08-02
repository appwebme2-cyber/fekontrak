const BASE_URL = 'https://bekontrak-production.up.railway.app/api'; // Sesuaikan dengan route ASP.NET Anda

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};