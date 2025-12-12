/*
  Warnings:

  - The values [PENDING,CONFIRMED,PREPARING,READY,COMPLETED,CANCELLED,REFUNDED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,COMPLETED,FAILED,REFUNDED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,APPROVED,REJECTED] on the enum `ReviewStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [OPEN,CLOSED,TEMPORARILY_CLOSED] on the enum `ShopStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `acceptsCard` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `acceptsCash` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `acceptsDigitalWallet` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `customerReviews` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `dailySummary` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `newOrderAlerts` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `orderReadyReminders` on the `shops` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled', 'refunded');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('pending', 'completed', 'failed', 'refunded');
ALTER TABLE "public"."orders" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "public"."payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending';
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReviewStatus_new" AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE "public"."reviews" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reviews" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TYPE "ReviewStatus" RENAME TO "ReviewStatus_old";
ALTER TYPE "ReviewStatus_new" RENAME TO "ReviewStatus";
DROP TYPE "public"."ReviewStatus_old";
ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ShopStatus_new" AS ENUM ('open', 'closed', 'maintenance', 'inactive');
ALTER TABLE "public"."shops" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "shops" ALTER COLUMN "status" TYPE "ShopStatus_new" USING ("status"::text::"ShopStatus_new");
ALTER TYPE "ShopStatus" RENAME TO "ShopStatus_old";
ALTER TYPE "ShopStatus_new" RENAME TO "ShopStatus";
DROP TYPE "public"."ShopStatus_old";
ALTER TABLE "shops" ALTER COLUMN "status" SET DEFAULT 'open';
COMMIT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "paymentStatus" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "acceptsCard",
DROP COLUMN "acceptsCash",
DROP COLUMN "acceptsDigitalWallet",
DROP COLUMN "customerReviews",
DROP COLUMN "dailySummary",
DROP COLUMN "newOrderAlerts",
DROP COLUMN "orderReadyReminders",
ALTER COLUMN "status" SET DEFAULT 'open';
