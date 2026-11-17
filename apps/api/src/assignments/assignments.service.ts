import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAssignmentInput, GradeInput, SubmitInput } from './assignments.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  listForCourse(courseId: string) {
    return this.prisma.assignment.findMany({ where: { courseId }, orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }] });
  }

  create(courseId: string, input: CreateAssignmentInput) {
    return this.prisma.assignment.create({ data: { courseId, ...input } });
  }

  /** Students may save drafts or submit; late submissions are still accepted but flagged by timestamps. */
  async submit(userId: string, assignmentId: string, input: SubmitInput, draft = false) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    const enrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: assignment.courseId } },
    });
    if (!enrolled) throw new ForbiddenException('Enrol in the course before submitting');

    const existing = await this.prisma.submission.findUnique({ where: { assignmentId_userId: { assignmentId, userId } } });
    if (existing && (existing.status === 'GRADED')) throw new BadRequestException('Graded submissions are locked');

    const status = draft ? 'DRAFT' : 'SUBMITTED';
    const data = { ...input, status, submittedAt: draft ? null : new Date() } as const;
    return this.prisma.submission.upsert({
      where: { assignmentId_userId: { assignmentId, userId } },
      create: { assignmentId, userId, ...data },
      update: data,
    });
  }

  async grade(graderId: string, submissionId: string, input: GradeInput) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.status === 'DRAFT') throw new BadRequestException('Cannot grade a draft');
    if (input.score > submission.assignment.maxPoints) {
      throw new BadRequestException(`Score exceeds maximum of ${submission.assignment.maxPoints}`);
    }
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        graderId,
        score: input.score,
        feedback: input.feedback,
        status: input.returnToStudent ? 'RETURNED' : 'GRADED',
        gradedAt: new Date(),
      },
    });
  }

  queue(assignmentId: string) {
    return this.prisma.submission.findMany({
      where: { assignmentId, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'asc' },
      include: { user: { select: { id: true, displayName: true } } },
    });
  }
}
