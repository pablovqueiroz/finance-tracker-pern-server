/*
  Warnings:

  - The values [male,female,non_binary,trans_man,trans_woman,agender,genderfluid,prefer_not_to_say,other] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [income,expense] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `category` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('HOUSING', 'ELECTRICITY', 'WATER', 'GAS', 'HOME_INTERNET', 'MOBILE_PHONE', 'GROCERIES', 'RESTAURANTS_DELIVERY', 'TRANSPORT_FUEL', 'HEALTH_PHARMACY', 'LEISURE_HOBBIES', 'SUBSCRIPTIONS_STREAMING', 'SHOPPING', 'EDUCATION', 'PERSONAL_CARE', 'INVESTMENTS', 'DEBT_INSTALLMENTS', 'OTHERS');

-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'AGENDER', 'GENDERFLUID', 'PREFER_NOT_TO_SAY', 'OTHER');
ALTER TABLE "User" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('INCOME', 'EXPENSE');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_accountId_category_idx" ON "Transaction"("accountId", "category");
