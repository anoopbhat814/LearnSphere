import { z } from 'zod';

export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  avatarUrl?: string | null;
}

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  displayName: z.string().min(2).max(60),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}
