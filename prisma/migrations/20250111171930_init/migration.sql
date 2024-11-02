/*
  Warnings:

  - You are about to drop the `_FavoriteTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FavoriteTags" DROP CONSTRAINT "_FavoriteTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteTags" DROP CONSTRAINT "_FavoriteTags_B_fkey";

-- DropTable
DROP TABLE "_FavoriteTags";
