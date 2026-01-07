import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  database: 'mymlpractice-dev',
  schema: 'public',
  // autoLoadEntities: true,
  synchronize: false,
  logging: true,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  // cli: {
  //     migrationsDir: 'src/migrations',
  // }
};

export default config;
