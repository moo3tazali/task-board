import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig, ConfigSchema, authConfig } from './config';
import {
  PrismaModule,
  AuthModule,
  UsersModule,
  BoardsModule,
  BoardMembersModule,
  ListsModule,
  TasksModule,
} from './modules';

/**
 * Application module.
 * Defines the application configuration and imports.
 */
@Module({
  imports: [
    // Configure the application configuration module
    ConfigModule.forRoot({
      load: [appConfig, authConfig],
      isGlobal: true,
      validationSchema: ConfigSchema,
      validationOptions: {
        // Enable strict mode to ensure that all required configuration properties are provided
        abortEarly: true,
      },
    }),

    // Import modules
    PrismaModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    BoardMembersModule,
    ListsModule,
    TasksModule,
  ],
})
export class AppModule {}
