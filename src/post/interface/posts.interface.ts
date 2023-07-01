import { Post } from '@prisma/client';

export interface PostsResponse {
  data: Partial<Post>[];
  page: number;
  pageSize: number;
  total: number;
}
