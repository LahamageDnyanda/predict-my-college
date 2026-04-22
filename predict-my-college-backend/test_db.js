const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const colleges = await prisma.college.findMany();
  console.log("Found colleges:", colleges.length);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
