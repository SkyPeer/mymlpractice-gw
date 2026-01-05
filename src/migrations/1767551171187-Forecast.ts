import { MigrationInterface, QueryRunner } from "typeorm";

export class Forecast1767551171187 implements MigrationInterface {
    name = 'Forecast1767551171187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD "timeStamp" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP COLUMN "timeStamp"`);
    }

}
