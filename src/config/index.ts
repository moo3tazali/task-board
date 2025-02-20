import * as Joi from 'joi';
import { ConfigService } from '@nestjs/config';

import { AuthConfig } from './auth.config';
import { AppConfig } from './app.config';

/**
 * Interface defining the shape of the application configuration.
 * This interface is used to type-check the configuration object.
 */
export interface ConfigType {
  /**
   * Database configuration options.
   * This property is used to configure the TypeORM database connection.
   */
  app: AppConfig;
  auth: AuthConfig;
}

// extend the ConfigService class with the ConfigType interface
export class TConfigService extends ConfigService<ConfigType> {}

/**
 * Joi validation schema for the application configuration.
 * This schema defines the expected structure and constraints for the configuration object.
 */
export const ConfigSchema = Joi.object({
  // APP ENVS VARIABLES
  BASE_URL: Joi.string().default('http://localhost:3000'),
  PORT: Joi.number().default(3000),
  PREFIX: Joi.string().default(''),

  // DB ENVS VARIABLES
  DATABASE_URL: Joi.string().required(),

  // AUTH ENVS VARIABLES
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});

// Export the required configuration interfaces and schemas
export * from './app.config';
export * from './auth.config';
