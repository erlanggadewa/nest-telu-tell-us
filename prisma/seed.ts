import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.createMany({
    data: [
      {
        id: 'clo8f79zt0000founbwnkg8tr',
        email: 'todi@email.com',
        name: 'Todi Mahendra',
        password:
          '$2a$10$30d0kBlr22BKhgey27KxZu08bCNRTL5VYyUe3EPjRHpQBaVgnDB0C',
      },
      {
        id: 'clo8f7df50001foun64wl3cf6',
        email: 'maria@email.com',
        name: 'Maria Oktavia',
        password:
          '$2a$10$30d0kBlr22BKhgey27KxZu08bCNRTL5VYyUe3EPjRHpQBaVgnDB0C',
      },
    ],
  });
  console.log('🚀 ~ file: seed.ts:5 ~ main ~ users:', users);
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
