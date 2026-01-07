import { MigrationInterface, QueryRunner } from 'typeorm';

export class Forecast1767822174496 implements MigrationInterface {
  name = 'Forecast1767822174496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tf_trainings" DROP COLUMN "epoch"`);
    await queryRunner.query(`ALTER TABLE "tf_trainings" ADD "epoch" integer`);
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" ALTER COLUMN "loss" TYPE numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" ALTER COLUMN "loss" TYPE numeric(10,7)`,
    );
    await queryRunner.query(`ALTER TABLE "tf_trainings" DROP COLUMN "epoch"`);
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" ADD "epoch" numeric(10,7) NOT NULL`,
    );
  }
}
