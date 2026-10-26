import { MigrationInterface, QueryRunner } from 'typeorm';

// Weather data was provided by Open-Meteo API https://open-meteo.com/
// Months 1-36 span 2022, 2023 and 2024 in order.
const TEMPERATURES = [
  25.0, 25.5, 23.8, 21.2, 18.1, 15.3, 14.8, 16.2, 18.9, 21.4, 23.1, 24.6, 26.1,
  26.3, 24.2, 21.8, 18.5, 15.7, 14.2, 15.8, 19.3, 21.8, 23.7, 25.2, 25.4, 25.8,
  23.5, 20.9, 17.6, 14.9, 14.5, 16.0, 18.6, 21.1, 22.8, 24.3,
];

export class SeedAverageTemperature1740924612840 implements MigrationInterface {
  name = 'SeedAverageTemperature1740924612840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The city seed creates exactly one row and the temperatures attach to it.
    // Deliberately not matched by name: renaming the city in
    // SeedForecastCities1740924612800 must not break this seed.
    const [city] = await queryRunner.query(
      `SELECT id FROM forecast_cities ORDER BY id LIMIT 1`,
    );

    if (!city) {
      throw new Error('Cannot seed temperatures: no city was seeded.');
    }

    // unnest turns the two arrays into rows, so all 36 go in one statement
    // instead of 36 round trips.
    await queryRunner.query(
      `INSERT INTO average_temperature (month, temp, "cityId")
             SELECT month, temp, $2
             FROM unnest($1::numeric[]) WITH ORDINALITY AS t(temp, month)`,
      [TEMPERATURES, city.id],
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Seeds are not revertible - rebuild with db:drop, db:migrate, db:seed.',
    );
  }
}
