const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

type RequestOptions = {
  method?: string;
  body?: object;
  token?: string;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'APIエラー');
  return data;
};

export type ProfilePayload = {
  name: string;
  gender: string;
  birthdate: string;
};

export const authApi = {
  signup: (token: string, profile: ProfilePayload) =>
    request('/auth/signup', { method: 'POST', token, body: profile }),

  signin: (token: string) =>
    request<{ user: any }>('/auth/signin', { method: 'POST', token }),

  me: (token: string) =>
    request<{ user: any }>('/auth/me', { token }),
};
