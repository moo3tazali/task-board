export const testConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: '5432',
    username: 'postgres',
    password: 'postgres',
    database: 'tasks_e2e',
    synchronize: true,
  },
  auth: {
    jwt: {
      secret: 'secret',
      expiresIn: '1h',
    },
  },
};
