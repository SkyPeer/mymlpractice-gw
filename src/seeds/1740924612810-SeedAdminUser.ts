import { MigrationInterface, QueryRunner } from 'typeorm';
import { hashPassword } from '@app/user/password';

export class SeedAdminUser1740924612810 implements MigrationInterface {
  name = 'SeedAdminUser1740924612810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.SEED_ADMIN_USERNAME;
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    // The password arrives in plain text and is hashed here, with this
    // machine's PASSWORD_PEPPER, so each environment gets a hash its own app
    // can verify. Remove the SEED_ADMIN_* vars from .env once this has run - it
    // never runs again on the same database.
    if (!username || !email || !password) {
      throw new Error(
        'Set SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding.',
      );
    }

    // config.ts falls back to a dev pepper outside production; a hash made
    // with it would never verify against the real pepper the app starts with.
    if (!process.env.PASSWORD_PEPPER) {
      throw new Error('Set PASSWORD_PEPPER in .env before seeding.');
    }

    // The role is set here rather than by a follow-up migration: this is the
    // account that has to be able to manage users from the first run.
    await queryRunner.query(
      `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'admin')`,
      [username, email, await hashPassword(password)],
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'Seeds are not revertible - rebuild with db:drop, db:migrate, db:seed.',
    );
  }
}
