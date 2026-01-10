import { MigrationInterface, QueryRunner } from "typeorm";

export class Forecast1766427065278 implements MigrationInterface {
    name = 'Forecast1766427065278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD "cityId" integer`);
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1" FOREIGN KEY ("cityId") REFERENCES "forecast_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1"`);
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP COLUMN "cityId"`);
    }

}
