import { registerAs } from '@nestjs/config';

export interface AppConfig {
  baseUrl: string;
  port: number;
  prefix: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
    port: parseInt(process.env.PORT ?? '3000'),
    prefix: process.env.PREFIX ?? '',
  }),
);
