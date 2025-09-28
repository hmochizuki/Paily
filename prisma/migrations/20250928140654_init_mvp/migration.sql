/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "gender" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."couples" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "timezone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "couples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."couple_partners" (
    "couple_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "couple_partners_pkey" PRIMARY KEY ("couple_id","profile_id")
);

-- CreateTable
CREATE TABLE "public"."partner_invites" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "inviter_profile_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_profile_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shopping_lists" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shopping_list_items" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "added_by" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "note" TEXT,
    "quantity" TEXT,
    "revision" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shopping_list_item_states" (
    "item_id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_by" UUID,
    "checked_at" TIMESTAMPTZ(6),

    CONSTRAINT "shopping_list_item_states_pkey" PRIMARY KEY ("item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_invites_code_key" ON "public"."partner_invites"("code");

-- CreateIndex
CREATE INDEX "shopping_lists_couple_id_idx" ON "public"."shopping_lists"("couple_id");

-- CreateIndex
CREATE INDEX "shopping_list_items_list_id_idx" ON "public"."shopping_list_items"("list_id");

-- CreateIndex
CREATE INDEX "shopping_list_items_couple_id_idx" ON "public"."shopping_list_items"("couple_id");

-- CreateIndex
CREATE INDEX "shopping_list_item_states_is_checked_idx" ON "public"."shopping_list_item_states"("is_checked");

-- CreateIndex
CREATE INDEX "shopping_list_item_states_couple_id_is_checked_idx" ON "public"."shopping_list_item_states"("couple_id", "is_checked");

-- AddForeignKey
ALTER TABLE "public"."couple_partners" ADD CONSTRAINT "couple_partners_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."couple_partners" ADD CONSTRAINT "couple_partners_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_invites" ADD CONSTRAINT "partner_invites_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_invites" ADD CONSTRAINT "partner_invites_inviter_profile_id_fkey" FOREIGN KEY ("inviter_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_invites" ADD CONSTRAINT "partner_invites_accepted_profile_id_fkey" FOREIGN KEY ("accepted_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_lists" ADD CONSTRAINT "shopping_lists_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_items" ADD CONSTRAINT "shopping_list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_items" ADD CONSTRAINT "shopping_list_items_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_items" ADD CONSTRAINT "shopping_list_items_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_item_states" ADD CONSTRAINT "shopping_list_item_states_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_list_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_item_states" ADD CONSTRAINT "shopping_list_item_states_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shopping_list_item_states" ADD CONSTRAINT "shopping_list_item_states_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
