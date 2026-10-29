import dotenv from 'dotenv';
import app from './src/app.js';
import { prisma } from './src/db/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected, server closed.');
    process.exit(0);
  });
});
