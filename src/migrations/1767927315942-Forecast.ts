import { MigrationInterface, QueryRunner } from "typeorm";

export class Forecast1767927315942 implements MigrationInterface {
    name = 'Forecast1767927315942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1"`);
        await queryRunner.query(`ALTER TABLE "average_temperature" ALTER COLUMN "cityId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD CONSTRAINT "UQ_6e04b1d763e80cfd6bdf9cebedd" UNIQUE ("month", "cityId")`);
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1" FOREIGN KEY ("cityId") REFERENCES "forecast_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1"`);
        await queryRunner.query(`ALTER TABLE "average_temperature" DROP CONSTRAINT "UQ_6e04b1d763e80cfd6bdf9cebedd"`);
        await queryRunner.query(`ALTER TABLE "average_temperature" ALTER COLUMN "cityId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "average_temperature" ADD CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1" FOREIGN KEY ("cityId") REFERENCES "forecast_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
