import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { PrismaService } from 'prisma/prisma.service';
import * as pactum from 'pactum';
import { CreateUserDto, EditUserDto } from 'user/dto';
import { SignInDto } from 'auth/dto';
import { CreatePostDto } from 'post/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const modulteRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulteRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(5000);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:5000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const signInData: SignInDto = {
      email: 'hello@gmail.com',
      password: '123456',
    };

    const signUpData: CreateUserDto = {
      email: 'hello@gmail.com',
      password: '123456',
      lastName: 'Test',
    };

    describe('Sign Up', () => {
      it('should sign up a new user', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody(signUpData)
          .expectStatus(HttpStatus.CREATED);
      });
    });

    describe('Sign In', () => {
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody(signInData)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Hello',
        email: 'hello@gmail.com',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });

  describe('Post', () => {
    describe('Create Post', () => {
      const dto: CreatePostDto = {
        url: 'https://youtu.be/_k-F-MMvQV4',
      };
      it('should create a post', () => {
        return pactum
          .spec()
          .post('/post')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('postId', 'id');
      });
    });

    describe('Get Posts', () => {
      it('should get posts with total one post', () => {
        return pactum
          .spec()
          .get('/post')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonMatch({ total: 1 });
      });
    });

    describe('Delete post by id', () => {
      it('should delete post by id', () => {
        return pactum
          .spec()
          .delete('/post/{id}')
          .withPathParams('id', '$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });
  });
});
