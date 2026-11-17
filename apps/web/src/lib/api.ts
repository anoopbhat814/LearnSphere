import type { AuthTokens, CourseDetailDto, CourseSummaryDto, Paginated } from '@learnsphere/shared-types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCourses: (params: Record<string, string> = {}) =>
    request<Paginated<CourseSummaryDto>>(`/courses?${new URLSearchParams(params)}`),
  getCourse: (slug: string) => request<CourseDetailDto>(`/courses/${slug}`),
  login: (email: string, password: string) =>
    request<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  enroll: (courseId: string, token: string) =>
    request(`/enrollments/${courseId}`, { method: 'POST' }, token),
};
