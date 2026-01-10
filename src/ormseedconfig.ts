import ormconfig from '@app/ormconfig';
const ormSeedConfig = {
  ...ormconfig,
  /*migrations: [__dirname + '/migrations/!**!/!*{.ts,.js}'],*/
  migrations: ['src/seeds/*.ts'],
  // cli: {
  //     migrationsDir: 'src/migrations',
  // }
};

export default ormSeedConfig;
