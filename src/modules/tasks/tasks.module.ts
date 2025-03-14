import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { RouterModule } from '@nestjs/core';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [
    RouterModule.register([
      {
        path: 'boards/:boardId',
        module: TasksModule,
      },
    ]),
  ],
  exports: [TasksService],
})
export class TasksModule {}
