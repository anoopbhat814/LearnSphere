import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { CertificateDto } from '@learnsphere/shared-types';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  private generateCode(): string {
    return `LS-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  }

  async issue(userId: string, courseId: string): Promise<CertificateDto> {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (!enrollment || enrollment.status !== 'COMPLETED') {
      throw new ForbiddenException('Course not completed');
    }
    const cert = await this.prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId, code: this.generateCode() },
      include: { user: true, course: true },
    });
    return this.toDto(cert);
  }

  async verify(code: string): Promise<CertificateDto> {
    const cert = await this.prisma.certificate.findUnique({ where: { code }, include: { user: true, course: true } });
    if (!cert) throw new NotFoundException('Certificate not found');
    return this.toDto(cert);
  }

  private toDto(c: { id: string; code: string; issuedAt: Date; pdfUrl: string | null; user: { displayName: string }; course: { title: string } }): CertificateDto {
    return { id: c.id, code: c.code, courseTitle: c.course.title, recipientName: c.user.displayName, issuedAt: c.issuedAt.toISOString(), pdfUrl: c.pdfUrl };
  }
}
