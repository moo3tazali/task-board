import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Define a configuration token 'db' using the registerAs function.
 * This token will be used to inject the database configuration into the application.
 */
export const localDbConfig = registerAs(
  'localDb',
  (): TypeOrmModuleOptions => {
    // Define the database configuration options
    return {
      // Specify the database type (in this case, PostgreSQL)
      type: 'postgres',

      // Set the database host (defaults to 'localhost' if not provided)
      host: process.env.DB_HOST ?? 'localhost',

      // Set the database port (defaults to 5432 if not provided)
      port: parseInt(process.env.DB_PORT ?? '5432'),

      // Set the database username (defaults to 'postgres' if not provided)
      username: process.env.DB_USERNAME ?? 'postgres',

      // Set the database password (defaults to 'postgres' if not provided)
      password: process.env.DB_PASSWORD ?? 'postgres',

      // Set the database name (defaults to 'tasks' if not provided)
      database: process.env.DB_NAME ?? 'tasks',

      // Set the entities to be loaded
      synchronize: Boolean(process.env.DB_SYNC ?? 'false'),
    };
  },
);
