import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { AuthTokens, LoginInput, RegisterInput } from '@learnsphere/shared-types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  private hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
    return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    const candidate = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
  }

  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.prisma.user.create({
      data: { email: input.email, displayName: input.displayName, passwordHash: this.hashPassword(input.password) },
    });
    return this.issueTokens(user.id, user.role);
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !this.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.role);
  }

  private issueTokens(userId: string, role: string): AuthTokens {
    const accessToken = this.jwt.sign({ sub: userId, role });
    const refreshToken = this.jwt.sign({ sub: userId, type: 'refresh' }, { expiresIn: '30d' });
    return { accessToken, refreshToken, expiresInSeconds: 900 };
  }
}
