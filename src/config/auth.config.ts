import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  secret: string;
  signOptions: { expiresIn: string };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    secret: process.env.JWT_SECRET as string,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    },
  }),
);
