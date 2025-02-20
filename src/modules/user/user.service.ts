import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PasswordService } from './password/password.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  public async createUser({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await this.passwordService.hash(password);

    return this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });
  }

  public async findOne(
    uniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where: uniqueInput });
  }

  public async findById(
    id: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: {
        passwordHash: true,
      },
    });
  }
}
