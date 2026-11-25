import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "sales" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"show_in_cart" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sales_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sales_id" integer;
  ALTER TABLE "sales_texts" ADD CONSTRAINT "sales_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "sales_code_idx" ON "sales" USING btree ("code");
  CREATE INDEX "sales_updated_at_idx" ON "sales" USING btree ("updated_at");
  CREATE INDEX "sales_created_at_idx" ON "sales" USING btree ("created_at");
  CREATE INDEX "sales_texts_order_parent" ON "sales_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sales_fk" FOREIGN KEY ("sales_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_sales_id_idx" ON "payload_locked_documents_rels" USING btree ("sales_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sales_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sales" CASCADE;
  DROP TABLE "sales_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sales_fk";
  
  DROP INDEX "payload_locked_documents_rels_sales_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sales_id";`)
}
