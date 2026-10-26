import ormconfig from '@app/ormconfig';

const ormSeedConfig = {
  ...ormconfig,
  migrations: ['src/seeds/*.ts'],
  // Fixtures are tracked apart from the schema history, so `migrations` holds
  // only real schema changes and the seed records can be cleared on their own.
  migrationsTableName: 'seeds',
};

export default ormSeedConfig;
