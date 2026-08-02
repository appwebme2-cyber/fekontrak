// Memantau semua request fetch ke API: kalau server balas 401 (token expired/invalid),
// broadcast event supaya AuthProvider bisa logout & redirect ke halaman login otomatis.
const API_HOST = 'bekontrak-production.up.railway.app';

const originalFetch = window.fetch;

window.fetch = async (...args: Parameters<typeof fetch>) => {
  const response = await originalFetch(...args);

  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
  if (response.status === 401 && url.includes(API_HOST)) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  return response;
};
