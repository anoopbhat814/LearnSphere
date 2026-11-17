import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Post(':courseId')
  @UseGuards(JwtGuard)
  issue(@Req() req: { user: { sub: string } }, @Param('courseId') courseId: string) {
    return this.certificates.issue(req.user.sub, courseId);
  }

  @Get('verify/:code')
  verify(@Param('code') code: string) {
    return this.certificates.verify(code);
  }
}
