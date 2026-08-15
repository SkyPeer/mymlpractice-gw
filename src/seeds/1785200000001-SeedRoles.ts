import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1785200000001 implements MigrationInterface {
  name = 'SeedRoles1785200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Promote the seeded test-user (admin@localhost.local / 123) so there is
    // an account able to manage users.
    await queryRunner.query(
      `UPDATE users SET role = 'admin' WHERE email = 'admin@localhost.local'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE users SET role = 'user' WHERE email = 'admin@localhost.local'`,
    );
  }
}
