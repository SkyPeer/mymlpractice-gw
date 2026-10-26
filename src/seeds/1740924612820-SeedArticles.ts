import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedArticles1740924612820 implements MigrationInterface {
  name = 'SeedArticles1740924612820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The articles below carry these names in their "tagList" column.
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffe'), ('nsetjs')`,
    );

    // Runs after SeedAdminUser1740924612810, which creates the admin. The
    // author is looked up rather than assumed to be id 1: a rolled back run
    // leaves users_id_seq advanced, so ids no longer start at one.
    const [admin] = await queryRunner.query(
      `SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`,
    );

    if (!admin) {
      throw new Error('Cannot seed articles: no admin user was seeded.');
    }

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
             VALUES ('first-article', 'first-article', 'first-article', 'first-article', 'coffe,dragons', $1),
                    ('second-article', 'second-article', 'second-article', 'second-article', 'coffe,dragons', $1)`,
      [admin.id],
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Seeds are not revertible - rebuild with db:drop, db:migrate, db:seed.',
    );
  }
}
