/**
 * Tiny fetch wrapper for the DineFlow API.
 *  • always sends cookies (credentials: 'include')
 *  • automatically adds the CSRF token to POST/PATCH/PUT/DELETE
 *  • turns error responses into ApiError with code + field errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

const BASE = import.meta.env.VITE_API_URL ?? '';
let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  csrfPromise ??= fetch(`${BASE}/api/auth/csrf`, { credentials: 'include' })
    .then((r) => {
      if (!r.ok) throw new ApiError(r.status, 'CSRF_FETCH_FAILED', 'Could not reach the server');
      return r.json();
    })
    .then((d: { csrfToken: string }) => {
      csrfToken = d.csrfToken;
      return d.csrfToken;
    })
    .finally(() => {
      csrfPromise = null;
    });
  return csrfPromise;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown, retried = false): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken ?? (await fetchCsrfToken());

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection.');
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data?.error ?? {};
    // CSRF token expired (e.g. server restarted) → get a new one and retry once.
    if (res.status === 403 && err.code === 'CSRF_INVALID' && !retried) {
      csrfToken = null;
      await fetchCsrfToken();
      return request<T>(method, path, body, true);
    }
    throw new ApiError(res.status, err.code ?? 'UNKNOWN', err.message ?? 'Request failed', err.details?.fields ?? {});
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  /** Call after login/logout so a fresh token is used next time. */
  resetCsrf: () => {
    csrfToken = null;
  },
};
