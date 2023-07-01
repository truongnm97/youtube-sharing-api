import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'user/user.service';
import { SignInDto } from './dto';
import { CreateUserDto } from 'user/dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private user: UserService,
  ) {}

  async signUp(dto: CreateUserDto) {
    return this.user.createUser(dto);
  }

  async signIn({ email, password }: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.hash, password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email);
  }

  async signToken(userId: string, email: string) {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('TOKEN_EXPIRY_TIME'),
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }

  async validateToken(token: string) {
    return this.jwt.verifyAsync(token, {
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
