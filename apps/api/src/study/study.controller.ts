import { Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { StudyService } from './study.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createNoteSchema, toggleBookmarkSchema, updateNoteSchema,
  CreateNoteInput, ToggleBookmarkInput, UpdateNoteInput,
} from './study.dto';

type Req_ = { user: { sub: string } };

@Controller('study')
@UseGuards(JwtGuard)
export class StudyController {
  constructor(private readonly study: StudyService) {}

  @Get('lessons/:lessonId/notes')
  notes(@Req() req: Req_, @Param('lessonId') lessonId: string) {
    return this.study.listNotes(req.user.sub, lessonId);
  }

  @Get('lessons/:lessonId/notes.md')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  exportNotes(@Req() req: Req_, @Param('lessonId') lessonId: string) {
    return this.study.exportMarkdown(req.user.sub, lessonId);
  }

  @Post('lessons/:lessonId/notes')
  addNote(@Req() req: Req_, @Param('lessonId') lessonId: string, @Body(new ZodValidationPipe(createNoteSchema)) body: CreateNoteInput) {
    return this.study.addNote(req.user.sub, lessonId, body);
  }

  @Patch('notes/:id')
  updateNote(@Req() req: Req_, @Param('id') id: string, @Body(new ZodValidationPipe(updateNoteSchema)) body: UpdateNoteInput) {
    return this.study.updateNote(req.user.sub, id, body);
  }

  @Delete('notes/:id')
  @HttpCode(204)
  deleteNote(@Req() req: Req_, @Param('id') id: string) {
    return this.study.deleteNote(req.user.sub, id);
  }

  @Get('bookmarks')
  bookmarks(@Req() req: Req_) {
    return this.study.listBookmarks(req.user.sub);
  }

  @Post('bookmarks/toggle')
  toggle(@Req() req: Req_, @Body(new ZodValidationPipe(toggleBookmarkSchema)) body: ToggleBookmarkInput) {
    return this.study.toggleBookmark(req.user.sub, body);
  }
}
