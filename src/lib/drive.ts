// Dünner Wrapper um die Google Drive REST API v3. Verwendet ausschließlich den
// drive.file-Scope: die App sieht nur Dateien, die sie selbst angelegt hat (3.3).
import { getAccessToken } from './googleAuth';

const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export const APP_DATA_FILENAME = 'kraft-mobility-daten.json';

export interface DriveFileMeta {
  id: string;
  name: string;
  headRevisionId?: string;
  modifiedTime?: string;
}

async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google-Drive-Anfrage fehlgeschlagen (${res.status}): ${text.slice(0, 300)}`);
  }
  return res;
}

const META_FIELDS = 'id,name,headRevisionId,modifiedTime';

export async function findAppDataFile(): Promise<DriveFileMeta | null> {
  const q = encodeURIComponent(`name = '${APP_DATA_FILENAME}' and trashed = false`);
  const res = await authFetch(`${API}/files?q=${q}&fields=files(${META_FIELDS})&spaces=drive&pageSize=1`);
  const data = (await res.json()) as { files?: DriveFileMeta[] };
  return data.files?.[0] ?? null;
}

export async function getFileMeta(fileId: string): Promise<DriveFileMeta> {
  const res = await authFetch(`${API}/files/${encodeURIComponent(fileId)}?fields=${META_FIELDS}`);
  return res.json();
}

export async function downloadFile<T>(fileId: string): Promise<T> {
  const res = await authFetch(`${API}/files/${encodeURIComponent(fileId)}?alt=media`);
  return res.json();
}

export async function createJsonFile(name: string, content: unknown): Promise<DriveFileMeta> {
  const boundary = 'kraftmob_boundary_' + Math.random().toString(36).slice(2);
  const metadata = { name, mimeType: 'application/json' };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(content)}\r\n` +
    `--${boundary}--`;
  const res = await authFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=${META_FIELDS}`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
  return res.json();
}

export async function updateJsonFile(fileId: string, content: unknown): Promise<DriveFileMeta> {
  const res = await authFetch(`${UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=media&fields=${META_FIELDS}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });
  return res.json();
}

export async function uploadBinaryFile(name: string, mimeType: string, data: Blob): Promise<DriveFileMeta> {
  const metadata = { name, mimeType };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', data);
  const res = await authFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=${META_FIELDS}`, {
    method: 'POST',
    body: form
  });
  return res.json();
}

export function fileDownloadUrl(fileId: string): string {
  return `${API}/files/${encodeURIComponent(fileId)}?alt=media`;
}

export async function fetchBinaryFileObjectUrl(fileId: string): Promise<string> {
  const res = await authFetch(fileDownloadUrl(fileId));
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
