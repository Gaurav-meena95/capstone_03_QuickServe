/*
  Warnings:

  - You are about to drop the column `slug` on the `shops` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."shops_slug_idx";

-- DropIndex
DROP INDEX "public"."shops_slug_key";

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "slug";
