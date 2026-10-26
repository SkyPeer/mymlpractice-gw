import { MigrationInterface, QueryRunner } from 'typeorm';

const getValues = (dataSetCount, offset) => {
  const valuesSql = [];

  for (let idx = 0; idx < dataSetCount; idx++) {
    valuesSql.push(
      `($${idx * offset + 1}, $${idx * offset + 2}, $${idx * offset + 3}, $${idx * offset + 4}, $${idx * offset + 5}, $${idx * offset + 6})`,
    );
  }
  return valuesSql;
};

const getDataSet = (dataSetCount, authorIds) => {
  const result = [];
  const sampleData = [
    'test-article0',
    'test-article1',
    'test-article2',
    'test-article3',
  ];

  for (let idx = 0; idx < dataSetCount; idx++) {
    // Author and sample text are picked independently: tying them together
    // makes every row identical as soon as a single user is seeded.
    const authorId = authorIds[Math.floor(Math.random() * authorIds.length)];
    const sampleId = Math.floor(Math.random() * sampleData.length);
    const sample = sampleData[sampleId];
    const arr = [
      sample,
      sample,
      sample,
      sample,
      `randomId${sampleId}`,
      authorId,
    ];
    result.push(...arr);
  }
  return result;
};

export class SeedBulkArticles1740924612830 implements MigrationInterface {
  name = 'SeedBulkArticles1740924612830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Authors are read back from the table instead of assuming ids 1..3: a
    // rolled back seed run leaves users_id_seq advanced, so those ids are not
    // guaranteed to exist on a retry.
    const authors = await queryRunner.query(`SELECT id FROM users ORDER BY id`);
    const authorIds = authors.map((author) => author.id);

    if (!authorIds.length) {
      throw new Error('Cannot seed articles: no users were seeded.');
    }

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
             VALUES ${getValues(10000, 6)};`,
      [...getDataSet(10000, authorIds)],
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Seeds are not revertible - rebuild with db:drop, db:migrate, db:seed.',
    );
  }
}
