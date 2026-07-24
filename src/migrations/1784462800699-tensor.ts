import { MigrationInterface, QueryRunner } from "typeorm";

export class Tensor1784462800699 implements MigrationInterface {
    name = 'Tensor1784462800699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tf_trainings" ("id" SERIAL NOT NULL, "epoch" integer, "loss" numeric(10,2) NOT NULL, "modelId" integer, CONSTRAINT "PK_d8a767cb3883a9726f4bbc5da76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tf_trainings" ADD CONSTRAINT "FK_08f21d34ef7c67d71e1adc34fe8" FOREIGN KEY ("modelId") REFERENCES "tf_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tf_trainings" DROP CONSTRAINT "FK_08f21d34ef7c67d71e1adc34fe8"`);
        await queryRunner.query(`DROP TABLE "tf_trainings"`);
    }

}
