import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { TaskStatus } from './model';
import {
  CreateTaskDto,
  CreateTaskLabelDto,
  TaskFiltersQueries,
  UpdateTaskDto,
} from './dto';
import { WrongTaskStatusException } from './exceptions';
import { Task, TaskLabel } from './entities';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private readonly labelsRepository: Repository<TaskLabel>,
  ) {}

  async findAll(
    filters: TaskFiltersQueries,
    pagination: any,
    userId: string,
  ): Promise<[Task[], number]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels')
      .where('task.userId = :userId', { userId });

    if (filters.status) {
      query.andWhere('task.status = :status', {
        status: filters.status,
      });
    }

    if (filters.search?.trim()) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    if (filters.labels?.length) {
      const subQuery = query
        .subQuery()
        .select('labels.taskId')
        .from('task_label', 'labels')
        .where('labels.name IN (:...names)', {
          names: filters.labels,
        })
        .getQuery();

      query.andWhere(`task.id IN ${subQuery}`);
    }

    query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);

    query.skip(pagination.offset).take(pagination.limit);

    return await query.getManyAndCount();
  }

  async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

  async create(task: CreateTaskDto): Promise<Task> {
    if (task.labels) {
      task.labels = this.getUniqueLabels(task.labels);
    }

    return await this.taskRepository.save(task);
  }

  async update(
    task: Task,
    updatedTask: UpdateTaskDto,
  ): Promise<Task> {
    if (
      updatedTask.status &&
      !this.isValidStatusTransition(task.status, updatedTask.status)
    ) {
      throw new WrongTaskStatusException();
    }

    if (updatedTask.labels) {
      updatedTask.labels = this.getUniqueLabels(updatedTask.labels);
    }

    Object.assign(task, updatedTask);
    return await this.taskRepository.save(task);
  }

  async delete(task: Task): Promise<void> {
    await this.taskRepository.delete(task.id);
  }

  async addLabels(
    task: Task,
    labelDtos: CreateTaskLabelDto[],
  ): Promise<Task> {
    // get existing labels names form the task
    const existingNames = new Set(
      task.labels.map((label) => label.name),
    );

    // Create a new unique labels
    const labels = this.getUniqueLabels(labelDtos)
      .filter((dto) => !existingNames.has(dto.name))
      .map((label) => this.labelsRepository.create(label));

    if (labels.length) {
      task.labels = [...task.labels, ...labels];
      return await this.taskRepository.save(task);
    }

    return task;
  }

  async removeLabels(
    task: Task,
    labelsToRemove: string[],
  ): Promise<Task> {
    task.labels = task.labels.filter(
      (label) => !labelsToRemove.includes(label.name),
    );

    return await this.taskRepository.save(task);
  }

  // Private methods
  //
  //
  //

  // Check if the new status is valid
  private isValidStatusTransition(
    current: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];

    return (
      statusOrder.indexOf(current) <= statusOrder.indexOf(newStatus)
    );
  }

  // Get unique labels from the list of labels
  private getUniqueLabels(
    labelDtos: CreateTaskLabelDto[],
  ): CreateTaskLabelDto[] {
    const uniqueNames = [
      ...new Set(labelDtos.map((label) => label.name)),
    ];

    return uniqueNames.map((name) => ({ name }));
  }
}
