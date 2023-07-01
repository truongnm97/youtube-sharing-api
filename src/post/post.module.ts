import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { EventsGateway } from 'events/event.gateway';
import { AuthModule } from 'auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PostService, EventsGateway],
  controllers: [PostController],
})
export class PostModule {}
