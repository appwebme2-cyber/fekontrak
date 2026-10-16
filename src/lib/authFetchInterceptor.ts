// Memantau semua request fetch ke API: kalau server balas 401 (token expired/invalid),
// broadcast event supaya AuthProvider bisa logout & redirect ke halaman login otomatis.
// Sekaligus menambahkan header "X-Ru" (RU pilihan Super Admin / Head Office) ke setiap request API.
import { getActiveRu } from './activeRu';

const API_HOST = 'bekontrak-production.up.railway.app';

const originalFetch = window.fetch;

window.fetch = async (...args: Parameters<typeof fetch>) => {
  const url = typeof args[0] === 'string'
    ? args[0]
    : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;
  const isApi = url.includes(API_HOST);

  const ru = isApi ? getActiveRu() : null;
  if (ru) {
    if (args[0] instanceof Request) {
      const headers = new Headers(args[0].headers);
      headers.set('X-Ru', ru);
      args[0] = new Request(args[0], { headers });
    } else {
      const headers = new Headers(args[1]?.headers);
      headers.set('X-Ru', ru);
      args[1] = { ...args[1], headers };
    }
  }

  const response = await originalFetch(...args);

  if (response.status === 401 && isApi) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  return response;
};
