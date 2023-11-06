import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.createMany({
    data: [
      {
        id: 'ba4a1c99-97ba-4ee0-8fb6-78d64a371083',
        email: 'todi@email.com',
        name: 'Todi Mahendra',
        imgUrl: 'https://picsum.photos/600',
        password:
          '$2a$10$30d0kBlr22BKhgey27KxZu08bCNRTL5VYyUe3EPjRHpQBaVgnDB0C',
      },
      {
        id: '87639b63-e1f6-4b31-b061-f20fc63840dd',
        email: 'maria@email.com',
        name: 'Maria Oktavia',
        imgUrl: 'https://picsum.photos/600',
        password:
          '$2a$10$30d0kBlr22BKhgey27KxZu08bCNRTL5VYyUe3EPjRHpQBaVgnDB0C',
      },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
