import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemoryCpuToTrainings1785000000000
  implements MigrationInterface
{
  name = 'AddMemoryCpuToTrainings1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" ADD "memory" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" ADD "cpu" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tf_trainings" DROP COLUMN "cpu"`);
    await queryRunner.query(`ALTER TABLE "tf_trainings" DROP COLUMN "memory"`);
  }
}
