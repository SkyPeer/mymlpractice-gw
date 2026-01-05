import { MigrationInterface, QueryRunner } from "typeorm";

export class Forecast1767619476219 implements MigrationInterface {
    name = 'Forecast1767619476219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tf_models" ADD "epochs" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tf_models" ADD "batchSize" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tf_models" DROP COLUMN "batchSize"`);
        await queryRunner.query(`ALTER TABLE "tf_models" DROP COLUMN "epochs"`);
    }

}
