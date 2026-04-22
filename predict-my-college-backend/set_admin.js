require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.update({
  where: { email: 'lahamagednyanda@gmail.com' },
  data:  { role: 'admin' }
}).then(u => {
  console.log('✅ Admin promoted:', u.email, '| role:', u.role);
}).catch(e => {
  if (e.code === 'P2025') console.log('ℹ️  User not found yet — they need to register first.');
  else console.error('Error:', e.message);
}).finally(() => p.$disconnect());
