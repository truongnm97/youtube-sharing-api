import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PostsResponse } from './interface/posts.interface';
import { CreatePostDto } from './dto';
import { EventsGateway } from 'events/event.gateway';
import { getYouTubeVideoId } from 'utils';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private eventGateway: EventsGateway,
  ) {}

  async getPosts(page: number, pageSize: number): Promise<PostsResponse> {
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        url: true,
        youtubeId: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalPost = await this.prisma.post.count({});

    return {
      data: posts,
      page,
      pageSize,
      total: totalPost,
    };
  }

  async createPost(user: User, { url }: CreatePostDto) {
    const youtubeId = getYouTubeVideoId(url);

    if (!youtubeId) {
      throw new BadRequestException('Invalid Youtube URL');
    }

    try {
      const post = await this.prisma.post.create({
        data: {
          url,
          youtubeId,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      this.eventGateway.emitEvent('notification', post);

      return post;
    } catch (error) {
      throw error;
    }
  }

  deletePost(user: User, postId: string) {
    return this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }
}
