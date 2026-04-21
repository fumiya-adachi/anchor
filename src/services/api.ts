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

export type ProfileUpdatePayload = {
  bio?: string;
  location?: string;
  height?: number;
  weight?: number;
  experience_years?: number;
  frequency_per_week?: string;
  training_time?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  bench_press?: number;
  squat?: number;
  deadlift?: number;
  goals?: string[];
  tags?: Array<{ label: string; primary?: boolean }>;
  gym_name?: string;
  interest_ids?: number[];
};

export const authApi = {
  signup: (token: string, profile: ProfilePayload) =>
    request('/auth/signup', { method: 'POST', token, body: profile }),

  signin: (token: string) =>
    request<{ user: any }>('/auth/signin', { method: 'POST', token }),

  me: (token: string) =>
    request<{ user: any }>('/auth/me', { token }),
};

export const profileApi = {
  getMe: (token: string) =>
    request<{ profile: any }>('/profiles/me', { token }),

  updateMe: (token: string, payload: ProfileUpdatePayload) =>
    request<{ profile: any }>('/profiles/me', { method: 'PUT', token, body: payload }),

  getInterests: (token: string) =>
    request<{ interests: Array<{ id: number; name: string; category: string }> }>(
      '/profiles/interests',
      { token }
    ),

  getProfile: (token: string, userId: number) =>
    request<{ profile: any }>(`/profiles/${userId}`, { token }),
};
