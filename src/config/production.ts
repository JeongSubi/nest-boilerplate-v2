import path from 'path';

export = {
  host: {
    api: 'http://localhost:4000',
  },
  cookieDomain: 'localhost',
  cors: {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 204,
  },
  jwtSecret: {
    privateKey: 'string',
    publicKey: 'string',
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  database: {
    type: 'postgres',
    synchronize: true,
    timezone: '+00:00',
    charset: 'utf8mb4',
    legacySpatialSupport: false,
    bigNumberStrings: true,
    logging: false,
    debug: true,
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'test1234',
    database: 'nest-boilerplate-v2',
    subscribers: [],
    entities: [`${__dirname}/../entities/*.entity{.ts,.js}`],
    migrationsTableName: 'migrations',
    migrations: [path.join('src', 'migrations', '**', '*.ts')],
  },
};
