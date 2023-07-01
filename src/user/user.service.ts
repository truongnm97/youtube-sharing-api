import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto, EditUserDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        _count: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    delete user.hash;

    return user;
  }

  async createUser({
    email,
    password,
    role,
    firstName,
    lastName,
  }: CreateUserDto) {
    try {
      const hash = await argon.hash(password);
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
          role,
          firstName,
          lastName,
        },
      });

      delete user.hash;

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credential taken');
      }

      throw error;
    }
  }

  async editUser(userId: string, { password, ...dto }: EditUserDto) {
    try {
      let hash: string | undefined;
      if (password) {
        hash = await argon.hash(password);
      }
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...dto,
          ...(hash && { hash }),
        },
      });

      delete user.hash;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential taken');
        }
      }

      throw error;
    }
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });

    delete user.hash;

    return user;
  }
}
