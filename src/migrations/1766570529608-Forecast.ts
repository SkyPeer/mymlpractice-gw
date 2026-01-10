import { MigrationInterface, QueryRunner } from "typeorm";

export class Forecast1766570529608 implements MigrationInterface {
    name = 'Forecast1766570529608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD "train" numeric(10,7)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP COLUMN "train"`);
    }

}
