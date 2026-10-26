import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1789126822093 implements MigrationInterface {
  name = 'Migrations1789126822093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "body" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tagList" text NOT NULL, "favoritesCount" integer NOT NULL DEFAULT '0', "authorId" integer, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL DEFAULT '', "bio" character varying NOT NULL DEFAULT '', "image" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "forecast_temperature" ("id" SERIAL NOT NULL, "min" numeric(10,7) NOT NULL, "max" numeric(10,7) NOT NULL, "wind_speed" numeric(10,7) NOT NULL, "wind_direction" numeric(10,7) NOT NULL, "predict" numeric(10,7), "timeStamp" TIMESTAMP NOT NULL DEFAULT now(), "random" boolean NOT NULL, "cityId" integer, CONSTRAINT "PK_cdde3362732393fc9fa6ae8481b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "average_temperature" ("id" SERIAL NOT NULL, "temp" numeric(10,7), "train" numeric(10,7), "predict" numeric(10,7), "month" numeric(10,7) NOT NULL, "timeStamp" TIMESTAMP NOT NULL DEFAULT now(), "cityId" integer NOT NULL, CONSTRAINT "UQ_6e04b1d763e80cfd6bdf9cebedd" UNIQUE ("month", "cityId"), CONSTRAINT "PK_372e6cccad1c05a646e86151d80" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "forecast_cities" ("id" SERIAL NOT NULL, "lat" numeric(10,7) NOT NULL, "lon" numeric(10,7) NOT NULL, "city" character varying NOT NULL DEFAULT '', "country" character varying NOT NULL DEFAULT '', "description" character varying NOT NULL DEFAULT '', "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), "tfModelId" integer, CONSTRAINT "REL_ab4fbb78e2b697e7351de1610c" UNIQUE ("tfModelId"), CONSTRAINT "PK_8920bd1a2de2bc3381c2f60c07a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tf_models" ("id" SERIAL NOT NULL, "model_name" character varying NOT NULL, "epochs" integer NOT NULL, "batchSize" integer NOT NULL, "model_topology" character varying NOT NULL DEFAULT '', "weight_specs" character varying NOT NULL DEFAULT '', "weights" bytea, "description" character varying NOT NULL DEFAULT '', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1ae0a6a573ab6f52c7e4314fb1c" UNIQUE ("model_name"), CONSTRAINT "PK_7535f78d9ddfede727452bc5313" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tf_trainings" ("id" SERIAL NOT NULL, "epoch" integer, "loss" numeric(10,2) NOT NULL, "memory" numeric(10,2), "cpu" numeric(10,2), "modelId" integer, CONSTRAINT "PK_d8a767cb3883a9726f4bbc5da76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_favorites_articles" ("usersId" integer NOT NULL, "articlesId" integer NOT NULL, CONSTRAINT "PK_aebb5070a5fa58957adae6d78af" PRIMARY KEY ("usersId", "articlesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad" ON "users_favorites_articles" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61dc60abcf0035e5ce2aea013b" ON "users_favorites_articles" ("articlesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_temperature" ADD CONSTRAINT "FK_cacad057146ea72b6c1ea581de6" FOREIGN KEY ("cityId") REFERENCES "forecast_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "average_temperature" ADD CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1" FOREIGN KEY ("cityId") REFERENCES "forecast_cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_cities" ADD CONSTRAINT "FK_ab4fbb78e2b697e7351de1610c9" FOREIGN KEY ("tfModelId") REFERENCES "tf_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" ADD CONSTRAINT "FK_08f21d34ef7c67d71e1adc34fe8" FOREIGN KEY ("modelId") REFERENCES "tf_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" ADD CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" ADD CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" DROP CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" DROP CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tf_trainings" DROP CONSTRAINT "FK_08f21d34ef7c67d71e1adc34fe8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_cities" DROP CONSTRAINT "FK_ab4fbb78e2b697e7351de1610c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "average_temperature" DROP CONSTRAINT "FK_9921c6f0f12438bd98ad0ee75d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_temperature" DROP CONSTRAINT "FK_cacad057146ea72b6c1ea581de6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61dc60abcf0035e5ce2aea013b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3bc5ca3e98f5f3858dbf626ad"`,
    );
    await queryRunner.query(`DROP TABLE "users_favorites_articles"`);
    await queryRunner.query(`DROP TABLE "tf_trainings"`);
    await queryRunner.query(`DROP TABLE "tf_models"`);
    await queryRunner.query(`DROP TABLE "forecast_cities"`);
    await queryRunner.query(`DROP TABLE "average_temperature"`);
    await queryRunner.query(`DROP TABLE "forecast_temperature"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "articles"`);
  }
}
