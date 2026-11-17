import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ForumService } from './forum.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { createPostSchema, createThreadSchema, voteSchema, CreatePostInput, CreateThreadInput } from '@learnsphere/shared-types';

type Req_ = { user: { sub: string } };

@Controller('forum')
export class ForumController {
  constructor(private readonly forum: ForumService) {}

  @Get('courses/:courseId/threads')
  threads(@Param('courseId') courseId: string) {
    return this.forum.listThreads(courseId);
  }

  @Post('courses/:courseId/threads')
  @UseGuards(JwtGuard)
  create(@Req() req: Req_, @Param('courseId') courseId: string, @Body(new ZodValidationPipe(createThreadSchema)) body: CreateThreadInput) {
    return this.forum.createThread(req.user.sub, courseId, body);
  }

  @Get('threads/:id/posts')
  posts(@Param('id') id: string) {
    return this.forum.listPosts(id);
  }

  @Post('threads/:id/posts')
  @UseGuards(JwtGuard)
  reply(@Req() req: Req_, @Param('id') id: string, @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostInput) {
    return this.forum.reply(req.user.sub, id, body);
  }

  @Post('posts/:id/vote')
  @UseGuards(JwtGuard)
  vote(@Req() req: Req_, @Param('id') id: string, @Body(new ZodValidationPipe(voteSchema)) body: { value: 1 | -1 }) {
    return this.forum.vote(req.user.sub, id, body.value);
  }
}
