// Google-Anmeldung über Google Identity Services (GIS), OAuth-Scope drive.file
// (Lastenheft 3.3). Einmalige Anmeldung pro Gerät, danach versucht die App bei
// Bedarf eine stille Token-Erneuerung, solange die Google-Sitzung im Browser
// aktiv ist.
const GIS_SRC = 'https://accounts.google.com/gsi/client';
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const CLIENT_ID_KEY = 'kraftmob_gcp_client_id';
const SIGNED_IN_ONCE_KEY = 'kraftmob_signed_in_once';

let tokenClient: GoogleTokenClient | undefined;
let currentToken: { accessToken: string; expiresAt: number } | null = null;
let gisLoadPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Identity Services konnte nicht geladen werden.')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Identity Services konnte nicht geladen werden.'));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

export function getClientId(): string | null {
  return localStorage.getItem(CLIENT_ID_KEY);
}

export function setClientId(id: string): void {
  localStorage.setItem(CLIENT_ID_KEY, id.trim());
  tokenClient = undefined;
}

export function hasSignedInBefore(): boolean {
  return localStorage.getItem(SIGNED_IN_ONCE_KEY) === '1';
}

type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

export function onAuthChange(fn: TokenListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setToken(resp: GoogleTokenResponse) {
  currentToken = { accessToken: resp.access_token, expiresAt: Date.now() + Math.max(0, resp.expires_in - 60) * 1000 };
  localStorage.setItem(SIGNED_IN_ONCE_KEY, '1');
  listeners.forEach((fn) => fn(currentToken!.accessToken));
}

async function ensureTokenClient(): Promise<GoogleTokenClient> {
  await loadGis();
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Keine Google-Client-ID konfiguriert. Bitte in den Einstellungen hinterlegen.');
  }
  if (!tokenClient) {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: () => {}
    });
  }
  return tokenClient;
}

export function isSignedIn(): boolean {
  return !!currentToken && currentToken.expiresAt > Date.now();
}

/** Erzwingt den Google-Anmeldedialog (erstmalige Anmeldung pro Gerät). */
export async function signIn(): Promise<string> {
  const client = await ensureTokenClient();
  return new Promise((resolve, reject) => {
    client.callback = (resp) => {
      if (resp.error) {
        reject(new Error(resp.error_description || resp.error));
        return;
      }
      setToken(resp);
      resolve(resp.access_token);
    };
    client.requestAccessToken({ prompt: 'consent' });
  });
}

/** Liefert ein gültiges Access Token, erneuert es bei Bedarf still im Hintergrund. */
export async function getAccessToken(): Promise<string> {
  if (currentToken && currentToken.expiresAt > Date.now()) {
    return currentToken.accessToken;
  }
  const client = await ensureTokenClient();
  return new Promise((resolve, reject) => {
    client.callback = (resp) => {
      if (resp.error) {
        reject(new Error(resp.error_description || resp.error));
        return;
      }
      setToken(resp);
      resolve(resp.access_token);
    };
    client.requestAccessToken({ prompt: '' });
  });
}

export function signOut(): void {
  if (currentToken) {
    window.google?.accounts.oauth2.revoke(currentToken.accessToken, () => {});
  }
  currentToken = null;
  listeners.forEach((fn) => fn(null));
}
