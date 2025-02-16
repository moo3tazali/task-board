import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task, TaskLabel } from './entities';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  // import the entity Task to use in the tasks module
  imports: [TypeOrmModule.forFeature([Task, TaskLabel])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
