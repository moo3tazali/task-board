import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  CreateTaskLabelDto,
  TaskFiltersQueries,
  TaskIdParams,
  UpdateTaskDto,
} from './dto';
import { WrongTaskStatusException } from './exceptions';
import { Task } from './entities';
import { Auth } from '../src/users/decorators';

@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // add labels to task
  @Post(':id/labels')
  public async addLabels(
    @Param() params: TaskIdParams,
    @Body() body: CreateTaskLabelDto[],
    @Auth('sub') userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);

    this.checkTaskOwnership(task, userId);

    return this.tasksService.addLabels(task, body);
  }

  // Remove labels from task
  @Delete(':id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeLabels(
    @Param() params: TaskIdParams,
    @Body() body: string[],
    @Auth('sub') userId: string,
  ): Promise<void> {
    const task = await this.findOneOrFail(params.id);

    this.checkTaskOwnership(task, userId);

    await this.tasksService.removeLabels(task, body);
  }

  // find all tasks
  @Get()
  public async findAll(
    @Query() filters: TaskFiltersQueries,
    @Query() pagination: any,
    @Auth('sub') userId: string,
  ) {
    const [items, total] = await this.tasksService.findAll(
      filters,
      pagination,
      userId,
    );

    return {
      data: items,
      meta: {
        total,
        ...pagination,
      },
    };
  }

  // find one task by id
  @Get(':id')
  public async findOne(
    @Param() params: TaskIdParams,
    @Auth('sub') userId: string,
  ): Promise<Task> {
    const taks = await this.findOneOrFail(params.id);

    this.checkTaskOwnership(taks, userId);

    return taks;
  }

  // create a new task
  @Post()
  public async create(
    @Auth('sub') userId: string,
    @Body() body: CreateTaskDto,
  ): Promise<Task> {
    const task = { ...body, userId };

    return this.tasksService.create(task);
  }

  // update a task
  @Patch(':id')
  public async update(
    @Param() params: TaskIdParams,
    @Body() body: UpdateTaskDto,
    @Auth('sub') userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);

    this.checkTaskOwnership(task, userId);

    try {
      return this.tasksService.update(task, body);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }

  // delete a task
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @Param() params: TaskIdParams,
    @Auth('sub') userId: string,
  ): Promise<void> {
    const task = await this.findOneOrFail(params.id);

    this.checkTaskOwnership(task, userId);

    await this.tasksService.delete(task);
  }

  // private methods
  //
  //
  //
  // find one or fail
  private async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findOne(id);

    if (!task) {
      throw new NotFoundException(`Task with id [${id}] not found`);
    }

    return task;
  }

  private checkTaskOwnership(task: Task, userId: string): void {
    if (task.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );
    }
  }
}
