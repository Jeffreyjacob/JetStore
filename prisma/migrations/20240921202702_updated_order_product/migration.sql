/*
  Warnings:

  - You are about to drop the column `storeId` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `ProductOwner` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_storeId_fkey";

-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "ProductOwner" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "storeId";
