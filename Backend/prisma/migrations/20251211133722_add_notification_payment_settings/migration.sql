-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "acceptsCard" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsCash" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsDigitalWallet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customerReviews" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dailySummary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newOrderAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderReadyReminders" BOOLEAN NOT NULL DEFAULT true;
