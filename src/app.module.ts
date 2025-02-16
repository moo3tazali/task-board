import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import {
  localDbConfig,
  prodDbConfig,
  appConfig,
  ConfigSchema,
  TConfigService,
  authConfig,
  AuthConfig,
} from './config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities';
import { AuthGuard, RolesGuard } from './users/guards';

/**
 * Application module.
 * Defines the application configuration and imports.
 */
@Module({
  imports: [
    // Configure the application configuration module
    ConfigModule.forRoot({
      load: [appConfig, localDbConfig, prodDbConfig, authConfig],
      isGlobal: true,
      validationSchema: ConfigSchema,
      validationOptions: {
        // Enable strict mode to ensure that all required configuration properties are provided
        abortEarly: true,
      },
    }),

    // Configure the TypeORM database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: TConfigService) => ({
        ...(await config.get('localDb')),
        entities: [User],
      }),
    }),

    // Configure the authentication module
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: TConfigService) => ({
        ...config.get<AuthConfig>('auth'),
      }),
    }),

    // Import modules
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
