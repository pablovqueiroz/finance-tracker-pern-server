-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'SALARY';
ALTER TYPE "Category" ADD VALUE 'BONUS';
ALTER TYPE "Category" ADD VALUE 'FREELANCE';
ALTER TYPE "Category" ADD VALUE 'BUSINESS_REVENUE';
ALTER TYPE "Category" ADD VALUE 'RENTAL_INCOME';
ALTER TYPE "Category" ADD VALUE 'DIVIDENDS';
ALTER TYPE "Category" ADD VALUE 'INTEREST';
ALTER TYPE "Category" ADD VALUE 'REFUNDS';
ALTER TYPE "Category" ADD VALUE 'GIFTS_RECEIVED';
