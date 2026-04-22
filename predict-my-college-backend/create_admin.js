require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@futurecollege.com' },
    update: { role: 'admin', password: hashed },
    create: { name: 'Admin', email: 'admin@futurecollege.com', password: hashed, role: 'admin' }
  });
  console.log('✅ Admin user ready:', user.email, '| role:', user.role);
  console.log('   Email   : admin@futurecollege.com');
  console.log('   Password: admin123');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
