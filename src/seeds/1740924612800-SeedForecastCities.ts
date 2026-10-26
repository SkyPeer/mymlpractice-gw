import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedForecastCities1740924612800 implements MigrationInterface {
  name = 'SeedForecastCities1740924612800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO forecast_cities (lat, lon, city, country, description)
             VALUES (1, -1, 'JustCity', 'JustCountry', 'JUSTCITY')`,
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Seeds are not revertible - rebuild with db:drop, db:migrate, db:seed.',
    );
  }
}
