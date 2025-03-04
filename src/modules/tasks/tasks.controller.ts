import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BoardPermission } from '@prisma/client';

import { TasksService } from './tasks.service';
import { Permissions } from '../auth/decorators';
import {
  AssignTaskDto,
  CreateTaskDto,
  MoveTaskDto,
  TaskIdDto,
  UpdateStatusDto,
  UpdateTaskDto,
} from './dtos';
import { BoardIdDto } from '../boards/dtos';
import { Task, TaskList } from './interfaces';
import { ListIdDto } from '../lists/dtos';
import { PaginationDto } from 'src/common/dtos';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_CREATE)
  @Post()
  public async createTask(
    @Param() _: BoardIdDto,
    @Body() createDto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(createDto);
  }

  /**
   * Assign task to a board member
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_ASSIGN)
  @HttpCode(HttpStatus.OK)
  @Post('assign')
  public async assignTask(
    @Param() _: BoardIdDto,
    @Body() { taskId, membersIds }: AssignTaskDto,
  ): Promise<void> {
    return this.tasksService.assignTask(taskId, membersIds);
  }

  /**
   * Unassign task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_UNASSIGN)
  @HttpCode(HttpStatus.OK)
  @Post('unassign')
  public async unassignTask(
    @Param() _: BoardIdDto,
    @Body() { taskId, membersIds }: AssignTaskDto,
  ): Promise<void> {
    return this.tasksService.unassignTask(taskId, membersIds);
  }

  /**
   * Update a task
   */
  @ApiBearerAuth()
  @Permissions(
    BoardPermission.TASK_UPDATE,
    BoardPermission.TASK_DUE_DATE_UPDATE,
  )
  @Patch()
  public async updateTask(
    @Param() _: BoardIdDto,
    @Body() updateDto: UpdateTaskDto,
  ): Promise<Task> {
    const { taskId, ...dto } = updateDto;

    return this.tasksService.update(taskId, dto);
  }

  /**
   * Update Task Status
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_STATUS_UPDATE)
  @Patch('status')
  public async updateTaskStatus(
    @Param() _: BoardIdDto,
    @Body() { taskId, status }: UpdateStatusDto,
  ): Promise<Task> {
    return this.tasksService.update(taskId, { status });
  }

  /**
   * Move a task to another list
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_MOVE)
  @Patch('move')
  public async updateTaskList(
    @Param() _: BoardIdDto,
    @Body() { taskId, listId }: MoveTaskDto,
  ): Promise<Task> {
    return this.tasksService.move(taskId, listId);
  }

  /**
   * Get a list of tasks for a specific list
   */
  @ApiBearerAuth()
  @Permissions()
  @Get('list/:listId')
  public async getTasks(
    @Param() _: BoardIdDto,
    @Param() { listId }: ListIdDto,
    @Query() pagination: PaginationDto,
  ): Promise<TaskList> {
    const [items, count] = await this.tasksService.getList(
      listId,
      pagination,
    );

    return {
      items,
      meta: { count, skip: pagination.skip, limit: pagination.limit },
    };
  }

  /**
   * Get a single task with assignees
   */
  @ApiBearerAuth()
  @Permissions()
  @Get(':taskId')
  public async getTask(
    @Param() _: BoardIdDto,
    @Param() { taskId }: TaskIdDto,
  ): Promise<Task> {
    return this.tasksService.getOne(taskId);
  }

  /**
   * Delete a task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_DELETE)
  @Delete(':taskId')
  public async deleteTask(
    @Param() _: BoardIdDto,
    @Param() { taskId }: TaskIdDto,
  ): Promise<void> {
    await this.tasksService.delete(taskId);
  }
}
