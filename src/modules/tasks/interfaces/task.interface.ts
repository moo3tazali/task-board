import { Task as PrismaTask, TaskStatus } from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

export class Task implements PrismaTask {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  /**
   * Task status
   * @example "NOT_STARTED" | "IN_PROGRESS" | "PENDING_REVIEW" | "COMPLETED" | "OVERDUE"
   */
  status: TaskStatus;
  /**
   * @example "2025-03-04T09:14:27.890Z"
   */
  dueDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskList implements Pagination<Task> {
  items: Task[];
  meta: { count: number; skip: number; limit: number };
}
