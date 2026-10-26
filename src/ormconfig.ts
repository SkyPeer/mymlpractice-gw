import { ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Loaded here as well as in config.ts: the TypeORM CLI entry points
// (ormdatasource / ormseeddatasource) pull in this file without ever touching
// config.ts, so db:migrate and db:seed would otherwise ignore .env entirely.
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Fall back to the local dev database, but never let production start on those
// defaults — a missing or misspelled var would otherwise quietly connect to
// whatever Postgres happens to be on localhost.
if (isProduction) {
  const missing = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter(
    (key) => !process.env[key],
  );

  if (missing.length) {
    throw new Error(
      `Database configuration is incomplete: ${missing.join(', ')} ` +
        'must be set in the environment before starting in production.',
    );
  }
}

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SCHEMA } =
  process.env;

const config: ConnectionOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  database: DB_NAME,
  schema: DB_SCHEMA,
  // autoLoadEntities: true,
  synchronize: false,
  logging: true,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  // cli: {
  //     migrationsDir: 'src/migrations',
  // }
};

export default config;
