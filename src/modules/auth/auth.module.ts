import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthConfig, TConfigService } from 'src/config';
import { AuthGuard, RolesGuard, PermissionsGuard } from './guards';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [
    // Configure the authentication module
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: TConfigService) => ({
        ...config.get<AuthConfig>('auth'),
      }),
    }),

    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AuthModule {}
