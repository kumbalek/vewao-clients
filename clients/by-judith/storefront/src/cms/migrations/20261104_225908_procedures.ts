import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_procedure_categories_blocks_points_section_style" AS ENUM('headings', 'labels', 'steps');
  CREATE TYPE "public"."enum_procedure_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__procedure_categories_v_blocks_points_section_style" AS ENUM('headings', 'labels', 'steps');
  CREATE TYPE "public"."enum__procedure_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_procedures_blocks_points_section_style" AS ENUM('headings', 'labels', 'steps');
  CREATE TYPE "public"."enum_procedures_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__procedures_v_blocks_points_section_style" AS ENUM('headings', 'labels', 'steps');
  CREATE TYPE "public"."enum__procedures_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "procedure_categories_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "procedure_categories_blocks_points_section_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "procedure_categories_blocks_points_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"style" "enum_procedure_categories_blocks_points_section_style" DEFAULT 'headings',
  	"block_name" varchar
  );
  
  CREATE TABLE "procedure_categories_blocks_preparation_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" jsonb
  );
  
  CREATE TABLE "procedure_categories_blocks_preparation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tagline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "procedure_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"slug" varchar,
  	"menu_description" varchar,
  	"title" varchar,
  	"perex" varchar,
  	"image_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_procedure_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_procedure_categories_v_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_procedure_categories_v_blocks_points_section_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_procedure_categories_v_blocks_points_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"style" "enum__procedure_categories_v_blocks_points_section_style" DEFAULT 'headings',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_procedure_categories_v_blocks_preparation_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_procedure_categories_v_blocks_preparation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tagline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_procedure_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_menu_description" varchar,
  	"version_title" varchar,
  	"version_perex" varchar,
  	"version_image_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__procedure_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "procedures_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "procedures_blocks_points_section_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "procedures_blocks_points_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"style" "enum_procedures_blocks_points_section_style" DEFAULT 'headings',
  	"block_name" varchar
  );
  
  CREATE TABLE "procedures_blocks_preparation_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" jsonb
  );
  
  CREATE TABLE "procedures_blocks_preparation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tagline" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "procedures_price_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"price" varchar,
  	"hidden" boolean
  );
  
  CREATE TABLE "procedures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"slug" varchar,
  	"category_id" integer,
  	"parent_id" integer,
  	"title" varchar,
  	"perex" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"annotation" varchar,
  	"annotation_link" varchar,
  	"price_summary" varchar,
  	"duration" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_procedures_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_procedures_v_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_procedures_v_blocks_points_section_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_procedures_v_blocks_points_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"style" "enum__procedures_v_blocks_points_section_style" DEFAULT 'headings',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_procedures_v_blocks_preparation_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_procedures_v_blocks_preparation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tagline" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_procedures_v_version_price_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"price" varchar,
  	"hidden" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_procedures_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_parent_id" integer,
  	"version_title" varchar,
  	"version_perex" varchar,
  	"version_image_id" integer,
  	"version_cta_label" varchar,
  	"version_annotation" varchar,
  	"version_annotation_link" varchar,
  	"version_price_summary" varchar,
  	"version_duration" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__procedures_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "procedure_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "procedures_id" integer;
  ALTER TABLE "procedure_categories_blocks_text_section" ADD CONSTRAINT "procedure_categories_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedure_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedure_categories_blocks_points_section_points" ADD CONSTRAINT "procedure_categories_blocks_points_section_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedure_categories_blocks_points_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedure_categories_blocks_points_section" ADD CONSTRAINT "procedure_categories_blocks_points_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedure_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedure_categories_blocks_preparation_points" ADD CONSTRAINT "procedure_categories_blocks_preparation_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedure_categories_blocks_preparation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedure_categories_blocks_preparation" ADD CONSTRAINT "procedure_categories_blocks_preparation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedure_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedure_categories" ADD CONSTRAINT "procedure_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v_blocks_text_section" ADD CONSTRAINT "_procedure_categories_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedure_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v_blocks_points_section_points" ADD CONSTRAINT "_procedure_categories_v_blocks_points_section_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedure_categories_v_blocks_points_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v_blocks_points_section" ADD CONSTRAINT "_procedure_categories_v_blocks_points_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedure_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v_blocks_preparation_points" ADD CONSTRAINT "_procedure_categories_v_blocks_preparation_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedure_categories_v_blocks_preparation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v_blocks_preparation" ADD CONSTRAINT "_procedure_categories_v_blocks_preparation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedure_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v" ADD CONSTRAINT "_procedure_categories_v_parent_id_procedure_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."procedure_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_procedure_categories_v" ADD CONSTRAINT "_procedure_categories_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "procedures_blocks_text_section" ADD CONSTRAINT "procedures_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedures_blocks_points_section_points" ADD CONSTRAINT "procedures_blocks_points_section_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedures_blocks_points_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedures_blocks_points_section" ADD CONSTRAINT "procedures_blocks_points_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedures_blocks_preparation_points" ADD CONSTRAINT "procedures_blocks_preparation_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedures_blocks_preparation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedures_blocks_preparation" ADD CONSTRAINT "procedures_blocks_preparation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedures_price_rows" ADD CONSTRAINT "procedures_price_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "procedures" ADD CONSTRAINT "procedures_category_id_procedure_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."procedure_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "procedures" ADD CONSTRAINT "procedures_parent_id_procedures_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."procedures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "procedures" ADD CONSTRAINT "procedures_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_procedures_v_blocks_text_section" ADD CONSTRAINT "_procedures_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedures_v_blocks_points_section_points" ADD CONSTRAINT "_procedures_v_blocks_points_section_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedures_v_blocks_points_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedures_v_blocks_points_section" ADD CONSTRAINT "_procedures_v_blocks_points_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedures_v_blocks_preparation_points" ADD CONSTRAINT "_procedures_v_blocks_preparation_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedures_v_blocks_preparation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedures_v_blocks_preparation" ADD CONSTRAINT "_procedures_v_blocks_preparation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedures_v_version_price_rows" ADD CONSTRAINT "_procedures_v_version_price_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_procedures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_procedures_v" ADD CONSTRAINT "_procedures_v_parent_id_procedures_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."procedures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_procedures_v" ADD CONSTRAINT "_procedures_v_version_category_id_procedure_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."procedure_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_procedures_v" ADD CONSTRAINT "_procedures_v_version_parent_id_procedures_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."procedures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_procedures_v" ADD CONSTRAINT "_procedures_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "procedure_categories_blocks_text_section_order_idx" ON "procedure_categories_blocks_text_section" USING btree ("_order");
  CREATE INDEX "procedure_categories_blocks_text_section_parent_id_idx" ON "procedure_categories_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "procedure_categories_blocks_text_section_path_idx" ON "procedure_categories_blocks_text_section" USING btree ("_path");
  CREATE INDEX "procedure_categories_blocks_points_section_points_order_idx" ON "procedure_categories_blocks_points_section_points" USING btree ("_order");
  CREATE INDEX "procedure_categories_blocks_points_section_points_parent_id_idx" ON "procedure_categories_blocks_points_section_points" USING btree ("_parent_id");
  CREATE INDEX "procedure_categories_blocks_points_section_order_idx" ON "procedure_categories_blocks_points_section" USING btree ("_order");
  CREATE INDEX "procedure_categories_blocks_points_section_parent_id_idx" ON "procedure_categories_blocks_points_section" USING btree ("_parent_id");
  CREATE INDEX "procedure_categories_blocks_points_section_path_idx" ON "procedure_categories_blocks_points_section" USING btree ("_path");
  CREATE INDEX "procedure_categories_blocks_preparation_points_order_idx" ON "procedure_categories_blocks_preparation_points" USING btree ("_order");
  CREATE INDEX "procedure_categories_blocks_preparation_points_parent_id_idx" ON "procedure_categories_blocks_preparation_points" USING btree ("_parent_id");
  CREATE INDEX "procedure_categories_blocks_preparation_order_idx" ON "procedure_categories_blocks_preparation" USING btree ("_order");
  CREATE INDEX "procedure_categories_blocks_preparation_parent_id_idx" ON "procedure_categories_blocks_preparation" USING btree ("_parent_id");
  CREATE INDEX "procedure_categories_blocks_preparation_path_idx" ON "procedure_categories_blocks_preparation" USING btree ("_path");
  CREATE INDEX "procedure_categories__order_idx" ON "procedure_categories" USING btree ("_order");
  CREATE UNIQUE INDEX "procedure_categories_slug_idx" ON "procedure_categories" USING btree ("slug");
  CREATE INDEX "procedure_categories_image_idx" ON "procedure_categories" USING btree ("image_id");
  CREATE INDEX "procedure_categories_updated_at_idx" ON "procedure_categories" USING btree ("updated_at");
  CREATE INDEX "procedure_categories_created_at_idx" ON "procedure_categories" USING btree ("created_at");
  CREATE INDEX "procedure_categories__status_idx" ON "procedure_categories" USING btree ("_status");
  CREATE INDEX "_procedure_categories_v_blocks_text_section_order_idx" ON "_procedure_categories_v_blocks_text_section" USING btree ("_order");
  CREATE INDEX "_procedure_categories_v_blocks_text_section_parent_id_idx" ON "_procedure_categories_v_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "_procedure_categories_v_blocks_text_section_path_idx" ON "_procedure_categories_v_blocks_text_section" USING btree ("_path");
  CREATE INDEX "_procedure_categories_v_blocks_points_section_points_order_idx" ON "_procedure_categories_v_blocks_points_section_points" USING btree ("_order");
  CREATE INDEX "_procedure_categories_v_blocks_points_section_points_parent_id_idx" ON "_procedure_categories_v_blocks_points_section_points" USING btree ("_parent_id");
  CREATE INDEX "_procedure_categories_v_blocks_points_section_order_idx" ON "_procedure_categories_v_blocks_points_section" USING btree ("_order");
  CREATE INDEX "_procedure_categories_v_blocks_points_section_parent_id_idx" ON "_procedure_categories_v_blocks_points_section" USING btree ("_parent_id");
  CREATE INDEX "_procedure_categories_v_blocks_points_section_path_idx" ON "_procedure_categories_v_blocks_points_section" USING btree ("_path");
  CREATE INDEX "_procedure_categories_v_blocks_preparation_points_order_idx" ON "_procedure_categories_v_blocks_preparation_points" USING btree ("_order");
  CREATE INDEX "_procedure_categories_v_blocks_preparation_points_parent_id_idx" ON "_procedure_categories_v_blocks_preparation_points" USING btree ("_parent_id");
  CREATE INDEX "_procedure_categories_v_blocks_preparation_order_idx" ON "_procedure_categories_v_blocks_preparation" USING btree ("_order");
  CREATE INDEX "_procedure_categories_v_blocks_preparation_parent_id_idx" ON "_procedure_categories_v_blocks_preparation" USING btree ("_parent_id");
  CREATE INDEX "_procedure_categories_v_blocks_preparation_path_idx" ON "_procedure_categories_v_blocks_preparation" USING btree ("_path");
  CREATE INDEX "_procedure_categories_v_parent_idx" ON "_procedure_categories_v" USING btree ("parent_id");
  CREATE INDEX "_procedure_categories_v_version_version__order_idx" ON "_procedure_categories_v" USING btree ("version__order");
  CREATE INDEX "_procedure_categories_v_version_version_slug_idx" ON "_procedure_categories_v" USING btree ("version_slug");
  CREATE INDEX "_procedure_categories_v_version_version_image_idx" ON "_procedure_categories_v" USING btree ("version_image_id");
  CREATE INDEX "_procedure_categories_v_version_version_updated_at_idx" ON "_procedure_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_procedure_categories_v_version_version_created_at_idx" ON "_procedure_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_procedure_categories_v_version_version__status_idx" ON "_procedure_categories_v" USING btree ("version__status");
  CREATE INDEX "_procedure_categories_v_created_at_idx" ON "_procedure_categories_v" USING btree ("created_at");
  CREATE INDEX "_procedure_categories_v_updated_at_idx" ON "_procedure_categories_v" USING btree ("updated_at");
  CREATE INDEX "_procedure_categories_v_latest_idx" ON "_procedure_categories_v" USING btree ("latest");
  CREATE INDEX "_procedure_categories_v_autosave_idx" ON "_procedure_categories_v" USING btree ("autosave");
  CREATE INDEX "procedures_blocks_text_section_order_idx" ON "procedures_blocks_text_section" USING btree ("_order");
  CREATE INDEX "procedures_blocks_text_section_parent_id_idx" ON "procedures_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "procedures_blocks_text_section_path_idx" ON "procedures_blocks_text_section" USING btree ("_path");
  CREATE INDEX "procedures_blocks_points_section_points_order_idx" ON "procedures_blocks_points_section_points" USING btree ("_order");
  CREATE INDEX "procedures_blocks_points_section_points_parent_id_idx" ON "procedures_blocks_points_section_points" USING btree ("_parent_id");
  CREATE INDEX "procedures_blocks_points_section_order_idx" ON "procedures_blocks_points_section" USING btree ("_order");
  CREATE INDEX "procedures_blocks_points_section_parent_id_idx" ON "procedures_blocks_points_section" USING btree ("_parent_id");
  CREATE INDEX "procedures_blocks_points_section_path_idx" ON "procedures_blocks_points_section" USING btree ("_path");
  CREATE INDEX "procedures_blocks_preparation_points_order_idx" ON "procedures_blocks_preparation_points" USING btree ("_order");
  CREATE INDEX "procedures_blocks_preparation_points_parent_id_idx" ON "procedures_blocks_preparation_points" USING btree ("_parent_id");
  CREATE INDEX "procedures_blocks_preparation_order_idx" ON "procedures_blocks_preparation" USING btree ("_order");
  CREATE INDEX "procedures_blocks_preparation_parent_id_idx" ON "procedures_blocks_preparation" USING btree ("_parent_id");
  CREATE INDEX "procedures_blocks_preparation_path_idx" ON "procedures_blocks_preparation" USING btree ("_path");
  CREATE INDEX "procedures_price_rows_order_idx" ON "procedures_price_rows" USING btree ("_order");
  CREATE INDEX "procedures_price_rows_parent_id_idx" ON "procedures_price_rows" USING btree ("_parent_id");
  CREATE INDEX "procedures__order_idx" ON "procedures" USING btree ("_order");
  CREATE UNIQUE INDEX "procedures_slug_idx" ON "procedures" USING btree ("slug");
  CREATE INDEX "procedures_category_idx" ON "procedures" USING btree ("category_id");
  CREATE INDEX "procedures_parent_idx" ON "procedures" USING btree ("parent_id");
  CREATE INDEX "procedures_image_idx" ON "procedures" USING btree ("image_id");
  CREATE INDEX "procedures_updated_at_idx" ON "procedures" USING btree ("updated_at");
  CREATE INDEX "procedures_created_at_idx" ON "procedures" USING btree ("created_at");
  CREATE INDEX "procedures__status_idx" ON "procedures" USING btree ("_status");
  CREATE INDEX "_procedures_v_blocks_text_section_order_idx" ON "_procedures_v_blocks_text_section" USING btree ("_order");
  CREATE INDEX "_procedures_v_blocks_text_section_parent_id_idx" ON "_procedures_v_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "_procedures_v_blocks_text_section_path_idx" ON "_procedures_v_blocks_text_section" USING btree ("_path");
  CREATE INDEX "_procedures_v_blocks_points_section_points_order_idx" ON "_procedures_v_blocks_points_section_points" USING btree ("_order");
  CREATE INDEX "_procedures_v_blocks_points_section_points_parent_id_idx" ON "_procedures_v_blocks_points_section_points" USING btree ("_parent_id");
  CREATE INDEX "_procedures_v_blocks_points_section_order_idx" ON "_procedures_v_blocks_points_section" USING btree ("_order");
  CREATE INDEX "_procedures_v_blocks_points_section_parent_id_idx" ON "_procedures_v_blocks_points_section" USING btree ("_parent_id");
  CREATE INDEX "_procedures_v_blocks_points_section_path_idx" ON "_procedures_v_blocks_points_section" USING btree ("_path");
  CREATE INDEX "_procedures_v_blocks_preparation_points_order_idx" ON "_procedures_v_blocks_preparation_points" USING btree ("_order");
  CREATE INDEX "_procedures_v_blocks_preparation_points_parent_id_idx" ON "_procedures_v_blocks_preparation_points" USING btree ("_parent_id");
  CREATE INDEX "_procedures_v_blocks_preparation_order_idx" ON "_procedures_v_blocks_preparation" USING btree ("_order");
  CREATE INDEX "_procedures_v_blocks_preparation_parent_id_idx" ON "_procedures_v_blocks_preparation" USING btree ("_parent_id");
  CREATE INDEX "_procedures_v_blocks_preparation_path_idx" ON "_procedures_v_blocks_preparation" USING btree ("_path");
  CREATE INDEX "_procedures_v_version_price_rows_order_idx" ON "_procedures_v_version_price_rows" USING btree ("_order");
  CREATE INDEX "_procedures_v_version_price_rows_parent_id_idx" ON "_procedures_v_version_price_rows" USING btree ("_parent_id");
  CREATE INDEX "_procedures_v_parent_idx" ON "_procedures_v" USING btree ("parent_id");
  CREATE INDEX "_procedures_v_version_version__order_idx" ON "_procedures_v" USING btree ("version__order");
  CREATE INDEX "_procedures_v_version_version_slug_idx" ON "_procedures_v" USING btree ("version_slug");
  CREATE INDEX "_procedures_v_version_version_category_idx" ON "_procedures_v" USING btree ("version_category_id");
  CREATE INDEX "_procedures_v_version_version_parent_idx" ON "_procedures_v" USING btree ("version_parent_id");
  CREATE INDEX "_procedures_v_version_version_image_idx" ON "_procedures_v" USING btree ("version_image_id");
  CREATE INDEX "_procedures_v_version_version_updated_at_idx" ON "_procedures_v" USING btree ("version_updated_at");
  CREATE INDEX "_procedures_v_version_version_created_at_idx" ON "_procedures_v" USING btree ("version_created_at");
  CREATE INDEX "_procedures_v_version_version__status_idx" ON "_procedures_v" USING btree ("version__status");
  CREATE INDEX "_procedures_v_created_at_idx" ON "_procedures_v" USING btree ("created_at");
  CREATE INDEX "_procedures_v_updated_at_idx" ON "_procedures_v" USING btree ("updated_at");
  CREATE INDEX "_procedures_v_latest_idx" ON "_procedures_v" USING btree ("latest");
  CREATE INDEX "_procedures_v_autosave_idx" ON "_procedures_v" USING btree ("autosave");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_procedure_categories_fk" FOREIGN KEY ("procedure_categories_id") REFERENCES "public"."procedure_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_procedures_fk" FOREIGN KEY ("procedures_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_procedure_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("procedure_categories_id");
  CREATE INDEX "payload_locked_documents_rels_procedures_id_idx" ON "payload_locked_documents_rels" USING btree ("procedures_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "procedure_categories_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedure_categories_blocks_points_section_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedure_categories_blocks_points_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedure_categories_blocks_preparation_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedure_categories_blocks_preparation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedure_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedure_categories_v_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedure_categories_v_blocks_points_section_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedure_categories_v_blocks_points_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedure_categories_v_blocks_preparation_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedure_categories_v_blocks_preparation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedure_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures_blocks_points_section_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures_blocks_points_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures_blocks_preparation_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures_blocks_preparation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures_price_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "procedures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v_blocks_points_section_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v_blocks_points_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v_blocks_preparation_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v_blocks_preparation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v_version_price_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_procedures_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "procedure_categories_blocks_text_section" CASCADE;
  DROP TABLE "procedure_categories_blocks_points_section_points" CASCADE;
  DROP TABLE "procedure_categories_blocks_points_section" CASCADE;
  DROP TABLE "procedure_categories_blocks_preparation_points" CASCADE;
  DROP TABLE "procedure_categories_blocks_preparation" CASCADE;
  DROP TABLE "procedure_categories" CASCADE;
  DROP TABLE "_procedure_categories_v_blocks_text_section" CASCADE;
  DROP TABLE "_procedure_categories_v_blocks_points_section_points" CASCADE;
  DROP TABLE "_procedure_categories_v_blocks_points_section" CASCADE;
  DROP TABLE "_procedure_categories_v_blocks_preparation_points" CASCADE;
  DROP TABLE "_procedure_categories_v_blocks_preparation" CASCADE;
  DROP TABLE "_procedure_categories_v" CASCADE;
  DROP TABLE "procedures_blocks_text_section" CASCADE;
  DROP TABLE "procedures_blocks_points_section_points" CASCADE;
  DROP TABLE "procedures_blocks_points_section" CASCADE;
  DROP TABLE "procedures_blocks_preparation_points" CASCADE;
  DROP TABLE "procedures_blocks_preparation" CASCADE;
  DROP TABLE "procedures_price_rows" CASCADE;
  DROP TABLE "procedures" CASCADE;
  DROP TABLE "_procedures_v_blocks_text_section" CASCADE;
  DROP TABLE "_procedures_v_blocks_points_section_points" CASCADE;
  DROP TABLE "_procedures_v_blocks_points_section" CASCADE;
  DROP TABLE "_procedures_v_blocks_preparation_points" CASCADE;
  DROP TABLE "_procedures_v_blocks_preparation" CASCADE;
  DROP TABLE "_procedures_v_version_price_rows" CASCADE;
  DROP TABLE "_procedures_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_procedure_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_procedures_fk";
  
  DROP INDEX "payload_locked_documents_rels_procedure_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_procedures_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "procedure_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "procedures_id";
  DROP TYPE "public"."enum_procedure_categories_blocks_points_section_style";
  DROP TYPE "public"."enum_procedure_categories_status";
  DROP TYPE "public"."enum__procedure_categories_v_blocks_points_section_style";
  DROP TYPE "public"."enum__procedure_categories_v_version_status";
  DROP TYPE "public"."enum_procedures_blocks_points_section_style";
  DROP TYPE "public"."enum_procedures_status";
  DROP TYPE "public"."enum__procedures_v_blocks_points_section_style";
  DROP TYPE "public"."enum__procedures_v_version_status";`)
}
