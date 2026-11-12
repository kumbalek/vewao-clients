import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "products" ADD COLUMN "ingredients" jsonb;
  ALTER TABLE "products" ADD COLUMN "information" jsonb;
  ALTER TABLE "_products_v" ADD COLUMN "version_subtitle" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_ingredients" jsonb;
  ALTER TABLE "_products_v" ADD COLUMN "version_information" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "subtitle";
  ALTER TABLE "products" DROP COLUMN "ingredients";
  ALTER TABLE "products" DROP COLUMN "information";
  ALTER TABLE "_products_v" DROP COLUMN "version_subtitle";
  ALTER TABLE "_products_v" DROP COLUMN "version_ingredients";
  ALTER TABLE "_products_v" DROP COLUMN "version_information";`)
}
