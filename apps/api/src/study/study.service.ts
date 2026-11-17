import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateNoteInput, ToggleBookmarkInput, UpdateNoteInput } from './study.dto';

/** Formats a playback offset as m:ss or h:mm:ss for note exports. */
export function formatTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  listNotes(userId: string, lessonId: string) {
    return this.prisma.note.findMany({ where: { userId, lessonId }, orderBy: { atSecond: 'asc' } });
  }

  addNote(userId: string, lessonId: string, input: CreateNoteInput) {
    return this.prisma.note.create({ data: { userId, lessonId, ...input } });
  }

  async updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
    await this.ownedNote(userId, noteId);
    return this.prisma.note.update({ where: { id: noteId }, data: input });
  }

  async deleteNote(userId: string, noteId: string) {
    await this.ownedNote(userId, noteId);
    await this.prisma.note.delete({ where: { id: noteId } });
  }

  async exportMarkdown(userId: string, lessonId: string): Promise<string> {
    const notes = await this.listNotes(userId, lessonId);
    return notes.map((n) => `- [${formatTimestamp(n.atSecond)}] ${n.body.replace(/\n+/g, ' ')}`).join('\n');
  }

  /** Adds the bookmark if absent, removes it if present; returns the resulting state. */
  async toggleBookmark(userId: string, input: ToggleBookmarkInput): Promise<{ bookmarked: boolean }> {
    const existing = await this.prisma.bookmark.findFirst({
      where: { userId, courseId: input.courseId, lessonId: input.lessonId ?? null },
    });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.bookmark.create({ data: { userId, ...input } });
    return { bookmarked: true };
  }

  listBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { course: { select: { slug: true, title: true } }, lesson: { select: { id: true, title: true } } },
    });
  }

  private async ownedNote(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException('Not your note');
    return note;
  }
}
