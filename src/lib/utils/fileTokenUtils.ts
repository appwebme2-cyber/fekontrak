const API_URL = "https://bekontrak-production.up.railway.app/api";
const FILE_PATH_PREFIX = "/api/FileUpload/file/";

function extractKey(url: string): string {
  const idx = url.indexOf(FILE_PATH_PREFIX);
  return idx === -1 ? '' : url.substring(idx + FILE_PATH_PREFIX.length).split('?')[0];
}

export function isFileUploadUrl(url: string): boolean {
  return url.includes(FILE_PATH_PREFIX);
}

export async function getTokenizedUrl(url: string): Promise<string> {
  if (!isFileUploadUrl(url)) return url;
  const key = extractKey(url);
  if (!key) return url;
  const token = localStorage.getItem('token');
  if (!token) return url;
  try {
    const res = await fetch(`${API_URL}/FileUpload/download-token?key=${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return url;
    const data = await res.json();
    return `${url.split('?')[0]}?t=${data.token}`;
  } catch {
    return url;
  }
}

export async function openFileInTab(url: string): Promise<void> {
  const tokenized = await getTokenizedUrl(url);
  window.open(tokenized, '_blank');
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  const tokenized = await getTokenizedUrl(url);
  const link = document.createElement('a');
  link.href = tokenized;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
