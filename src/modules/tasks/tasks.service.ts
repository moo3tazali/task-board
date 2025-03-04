import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class TasksService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

  public async create(dto: {
    listId: string;
    title: string;
    description?: string;
    dueDate?: string;
  }): Promise<Task> {
    return this.prisma.handle<Task>(() =>
      this.db.task.create({
        data: dto,
      }),
    );
  }

  public async getList(
    listId: string,
    pagination: PaginationDto,
  ): Promise<[Task[], number]> {
    return this.prisma.handle(() =>
      Promise.all([
        this.db.task.findMany({
          where: { listId },
          orderBy: { createdAt: pagination.order },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        this.db.task.count({ where: { listId } }),
      ]),
    );
  }

  public async getOne(taskId: string): Promise<Task> {
    return this.prisma.handle(() =>
      this.db.task.findUniqueOrThrow({
        where: { id: taskId },
      }),
    );
  }

  public async update(
    taskId: string,
    updatedDto: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      dueDate?: string;
    },
  ): Promise<Task> {
    return this.prisma.handle<Task>(() =>
      this.db.task.update({
        where: { id: taskId },
        data: updatedDto,
      }),
    );
  }

  public async move(taskId: string, listId: string): Promise<Task> {
    return this.prisma.handle<Task>(() =>
      this.db.task.update({
        where: { id: taskId },
        data: { listId },
      }),
    );
  }

  public async delete(taskId: string): Promise<void> {
    await this.prisma.handle(() =>
      this.db.task.delete({ where: { id: taskId } }),
    );
  }
}
