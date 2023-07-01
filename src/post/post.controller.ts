import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard, RolesGuard } from 'auth/guard';
import { GetUser } from 'auth/decorator';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get(':page?/:pageSize?')
  getPosts(
    @Param('page', new ParseIntPipe({ optional: true })) page = 1,
    @Param('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
  ) {
    return this.postService.getPosts(page, pageSize);
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtGuard)
  @Post()
  createPost(@GetUser() user: User, @Body() dto: CreatePostDto) {
    return this.postService.createPost(user, dto);
  }

  @UseGuards(RolesGuard)
  @UseGuards(JwtGuard)
  @Delete(':id')
  deletePost(@GetUser() user: User, @Param('id') postId: string) {
    return this.postService.deletePost(user, postId);
  }
}
