-- CreateEnum
CREATE TYPE "RoleChat" AS ENUM ('system', 'user', 'assistant', 'function');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "img_url" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_chat_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "list_chat_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_histories" (
    "id" TEXT NOT NULL,
    "order" SERIAL NOT NULL,
    "role" "RoleChat" NOT NULL,
    "messages" TEXT NOT NULL,
    "list_chat_history_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "chat_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "list_chat_histories" ADD CONSTRAINT "list_chat_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_histories" ADD CONSTRAINT "chat_histories_list_chat_history_id_fkey" FOREIGN KEY ("list_chat_history_id") REFERENCES "list_chat_histories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
