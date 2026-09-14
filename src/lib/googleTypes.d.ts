// Minimale Typisierung für Google Identity Services (GIS), da keine offiziellen
// Typdefinitionen eingebunden werden (kein zusätzliches npm-Paket nötig).
export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }): GoogleTokenClient;
          revoke(token: string, done: () => void): void;
        };
      };
    };
  }

  interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    error?: string;
    error_description?: string;
  }

  interface GoogleTokenClient {
    callback: (response: GoogleTokenResponse) => void;
    requestAccessToken(overrides?: { prompt?: string }): void;
  }
}
