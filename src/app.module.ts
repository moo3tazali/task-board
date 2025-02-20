import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  appConfig,
  ConfigSchema,
  authConfig,
  AuthConfig,
  TConfigService,
} from './config';
import { AuthGuard, RolesGuard } from './modules/auth/guards';
import { PrismaModule, AuthModule, UsersModule } from './modules';

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

    // Configure the authentication module
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: TConfigService) => ({
        ...config.get<AuthConfig>('auth'),
      }),
    }),

    // Import modules
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
