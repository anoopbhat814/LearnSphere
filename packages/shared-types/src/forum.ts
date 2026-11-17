import { z } from 'zod';

export interface ForumPostDto {
  id: string;
  threadId: string;
  authorName: string;
  parentId?: string | null;
  body: string;
  score: number;
  createdAt: string;
}

export interface ForumThreadDto {
  id: string;
  courseId: string;
  title: string;
  authorName: string;
  pinned: boolean;
  resolved: boolean;
  replyCount: number;
  createdAt: string;
}

export const createThreadSchema = z.object({
  title: z.string().min(5).max(160),
  body: z.string().min(10).max(8000),
});

export const createPostSchema = z.object({
  body: z.string().min(1).max(8000),
  parentId: z.string().optional(),
});

export const voteSchema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) });

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
