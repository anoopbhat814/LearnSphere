import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CourseDetailDto, CourseQuery, CourseSummaryDto, CreateCourseInput, Paginated } from '@learnsphere/shared-types';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: CourseQuery): Promise<Paginated<CourseSummaryDto>> {
    const page = q.page ?? 1;
    const pageSize = Math.min(q.pageSize ?? 12, 50);
    const where: Prisma.CourseWhereInput = {
      status: 'PUBLISHED',
      level: q.level,
      categoryId: q.categoryId,
      ...(q.search && {
        OR: [
          { title: { contains: q.search, mode: 'insensitive' } },
          { summary: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { publishedAt: 'desc' },
        include: { instructor: { include: { user: true } }, reviews: { select: { rating: true } }, _count: { select: { enrollments: true } } },
      }),
      this.prisma.course.count({ where }),
    ]);
    const items = rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      level: c.level,
      priceCents: c.priceCents,
      thumbnailUrl: c.thumbnailUrl,
      instructorName: c.instructor.user.displayName,
      rating: c.reviews.length ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length : null,
      enrollmentCount: c._count.enrollments,
    }));
    return { items, total, page, pageSize };
  }

  async findBySlug(slug: string): Promise<CourseDetailDto> {
    const c = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { include: { user: true } },
        modules: { orderBy: { position: 'asc' }, include: { lessons: { orderBy: { position: 'asc' } } } },
        tags: { include: { tag: true } },
        reviews: { select: { rating: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!c) throw new NotFoundException(`Course ${slug} not found`);
    return {
      id: c.id, slug: c.slug, title: c.title, summary: c.summary, description: c.description,
      level: c.level, priceCents: c.priceCents, thumbnailUrl: c.thumbnailUrl,
      instructorName: c.instructor.user.displayName,
      rating: c.reviews.length ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length : null,
      enrollmentCount: c._count.enrollments,
      modules: c.modules.map((m) => ({ id: m.id, title: m.title, position: m.position, lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type, position: l.position, durationSeconds: l.durationSeconds })) })),
      tags: c.tags.map((t) => t.tag.name),
    };
  }

  async create(instructorId: string, input: CreateCourseInput) {
    const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.course.create({
      data: {
        slug, title: input.title, summary: input.summary, description: input.description,
        level: input.level, priceCents: input.priceCents, categoryId: input.categoryId, instructorId,
        tags: { create: input.tags.map((name) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) },
      },
    });
  }
}
