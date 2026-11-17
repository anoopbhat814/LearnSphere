import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePostInput, CreateThreadInput, ForumPostDto, ForumThreadDto } from '@learnsphere/shared-types';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async listThreads(courseId: string): Promise<ForumThreadDto[]> {
    const threads = await this.prisma.forumThread.findMany({
      where: { courseId },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: { author: true, _count: { select: { posts: true } } },
    });
    return threads.map((t) => ({
      id: t.id, courseId: t.courseId, title: t.title, authorName: t.author.displayName,
      pinned: t.pinned, resolved: t.resolved, replyCount: Math.max(t._count.posts - 1, 0),
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async createThread(authorId: string, courseId: string, input: CreateThreadInput) {
    return this.prisma.forumThread.create({
      data: { courseId, authorId, title: input.title, posts: { create: { authorId, body: input.body } } },
    });
  }

  async listPosts(threadId: string): Promise<ForumPostDto[]> {
    const posts = await this.prisma.forumPost.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: { author: true, votes: true },
    });
    return posts.map((p) => ({
      id: p.id, threadId: p.threadId, authorName: p.author.displayName, parentId: p.parentId,
      body: p.body, score: p.votes.reduce((s, v) => s + v.value, 0), createdAt: p.createdAt.toISOString(),
    }));
  }

  async reply(authorId: string, threadId: string, input: CreatePostInput) {
    const thread = await this.prisma.forumThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread not found');
    return this.prisma.forumPost.create({ data: { threadId, authorId, body: input.body, parentId: input.parentId } });
  }

  vote(userId: string, postId: string, value: 1 | -1) {
    return this.prisma.postVote.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId, value },
      update: { value },
    });
  }
}
