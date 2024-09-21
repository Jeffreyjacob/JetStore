/*
  Warnings:

  - Added the required column `selectedColor` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedSize` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "selectedColor" TEXT NOT NULL,
ADD COLUMN     "selectedSize" TEXT NOT NULL;
