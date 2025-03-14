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
import { BoardPermission, NotificationType } from '@prisma/client';

import { TasksService } from './tasks.service';
import { Auth, Permissions } from '../auth/decorators';
import {
  AddLabelsDto,
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
import { NotificationsService } from '../notifications/notifications.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Create a new task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_CREATE)
  @Post()
  public async createTask(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() createDto: CreateTaskDto,
  ): Promise<Task> {
    const createdTask = await this.tasksService.create(createDto);

    this.notifications.notifiBoardMembers({
      boardId,
      userId,
      type: NotificationType.TASK_CREATED,
      data: { createdTask },
    });

    return createdTask;
  }

  /**
   * Assign task to a board members
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_ASSIGN)
  @HttpCode(HttpStatus.OK)
  @Post('assign')
  public async assignTask(
    // @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { taskId, membersIds }: AssignTaskDto,
  ): Promise<void> {
    await this.tasksService.assignTask(taskId, membersIds);

    this.notifications.createAndSend(
      membersIds.map((memberId) => ({
        userId: memberId,
        referenceId: boardId,
        type: NotificationType.TASK_ASSIGNED,
        data: { taskId },
      })),
    );
  }

  /**
   * Unassign task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_UNASSIGN)
  @HttpCode(HttpStatus.OK)
  @Post('unassign')
  public async unassignTask(
    @Param() { boardId }: BoardIdDto,
    @Body() { taskId, membersIds }: AssignTaskDto,
  ): Promise<void> {
    await this.tasksService.unassignTask(taskId, membersIds);

    this.notifications.createAndSend(
      membersIds.map((memberId) => ({
        userId: memberId,
        referenceId: boardId,
        type: NotificationType.TASK_UNASSIGNED,
        data: { taskId },
      })),
    );
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
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() updateDto: UpdateTaskDto,
  ): Promise<Task> {
    const { taskId, ...dto } = updateDto;

    const updatedTask = await this.tasksService.update(taskId, dto);

    this.notifications.notifiBoardOwnerAndMangers({
      boardId,
      userId,
      type: NotificationType.TASK_UPDATED,
      data: { updatedTask },
    });

    this.notifications.notifiTaskAssignees({
      taskId,
      userId,
      type: NotificationType.TASK_UPDATED,
      data: { updatedTask },
    });

    return updatedTask;
  }

  /**
   * Update Task Status
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_STATUS_UPDATE)
  @Patch('status')
  public async updateTaskStatus(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { taskId, status }: UpdateStatusDto,
  ): Promise<Task> {
    const updatedTask = await this.tasksService.update(taskId, {
      status,
    });

    this.notifications.notifiTaskAssignees({
      taskId,
      userId,
      type: NotificationType.TASK_STATUS_UPDATED,
      data: { updatedTask },
    });

    this.notifications.notifiBoardOwnerAndMangers({
      boardId,
      userId,
      type: NotificationType.TASK_STATUS_UPDATED,
      data: { updatedTask },
    });

    return updatedTask;
  }

  /**
   * Move a task to another list
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_MOVE)
  @Patch('move')
  public async updateTaskList(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { taskId, listId }: MoveTaskDto,
  ): Promise<Task> {
    const movedTask = await this.tasksService.move(taskId, listId);

    this.notifications.notifiTaskAssignees({
      taskId,
      userId,
      type: NotificationType.TASK_MOVED,
      data: { movedTask },
    });

    this.notifications.notifiBoardOwnerAndMangers({
      boardId,
      userId,
      type: NotificationType.TASK_MOVED,
      data: { movedTask },
    });

    return movedTask;
  }

  /**
   * Add labels to a task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_LABEL_CREATE)
  @Post('labels')
  public async addLabels(
    @Param() _: BoardIdDto,
    @Body() { labelsIds, taskId }: AddLabelsDto,
  ) {
    await this.tasksService.addLabels(taskId, labelsIds);
  }

  /**
   * delete labels from a task
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.TASK_LABEL_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('labels')
  public async deleteLabels(
    @Param() _: BoardIdDto,
    @Body() { labelsIds, taskId }: AddLabelsDto,
  ) {
    await this.tasksService.deleteLabels(taskId, labelsIds);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':taskId')
  public async deleteTask(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Param() { taskId }: TaskIdDto,
  ): Promise<void> {
    await this.tasksService.delete(taskId);

    this.notifications.notifiBoardMembers({
      boardId,
      userId,
      type: NotificationType.TASK_DELETED,
      data: { taskId },
    });
  }
}
