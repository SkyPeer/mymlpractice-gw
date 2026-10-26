import { MigrationInterface, QueryRunner } from 'typeorm';

const DAYS = 20;
const START_DATE = '2024-08-01';
const TEMP_RANGE = { minTemp1: 10, maxTemp1: 20, maxTemp2: 25 };

const buildRows = (cityId: number) => {
  const rows = [];
  const recordDate = new Date(START_DATE);

  for (let day = 0; day < DAYS; day++) {
    const min =
      Math.random() * (TEMP_RANGE.maxTemp1 - TEMP_RANGE.minTemp1) +
      TEMP_RANGE.minTemp1;
    const max = min + Math.random() * (TEMP_RANGE.maxTemp2 - min);

    rows.push([
      parseFloat(min.toFixed(1)),
      parseFloat(Math.min(max, TEMP_RANGE.maxTemp2).toFixed(1)),
      10, // wind_speed
      15, // wind_direction
      10, // predict
      new Date(recordDate),
      true, // random
      cityId,
    ]);

    recordDate.setDate(recordDate.getDate() + 1);
  }

  return rows;
};

const placeholders = (rowCount: number, columns: number) =>
  Array.from({ length: rowCount }, (_, row) => {
    const params = Array.from(
      { length: columns },
      (_, column) => `$${row * columns + column + 1}`,
    );
    return `(${params.join(', ')})`;
  }).join(', ');

export class SeedForecastTemperature1740924612850
  implements MigrationInterface
{
  name = 'SeedForecastTemperature1740924612850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The city seed creates exactly one row and the temperatures attach to it.
    // Deliberately not matched by name: renaming the city in
    // SeedForecastCities1740924612800 must not break this seed.
    const [city] = await queryRunner.query(
      `SELECT id FROM forecast_cities ORDER BY id LIMIT 1`,
    );

    if (!city) {
      throw new Error('Cannot seed forecasts: no city was seeded.');
    }

    const rows = buildRows(city.id);

    await queryRunner.query(
      `INSERT INTO forecast_temperature (min, max, wind_speed, wind_direction, predict, "timeStamp", random, "cityId")
             VALUES ${placeholders(rows.length, 8)}`,
      rows.flat(),
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Seeds are not revertible - rebuild with db:drop, db:migrate, db:seed.',
    );
  }
}
