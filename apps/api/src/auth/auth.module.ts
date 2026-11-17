import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { PrismaService } from '../common/prisma.service';

@Global()
@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } })],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, PrismaService],
  exports: [JwtModule, JwtGuard, PrismaService],
})
export class AuthModule {}
